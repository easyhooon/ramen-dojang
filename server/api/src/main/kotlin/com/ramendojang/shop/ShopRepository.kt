package com.ramendojang.shop

import com.ramendojang.shop.dto.CreateShopRequest
import com.ramendojang.shop.dto.ShopResponse
import com.ramendojang.shop.dto.UpdateShopRequest
import org.springframework.jdbc.core.simple.JdbcClient
import org.springframework.stereotype.Repository
import java.sql.ResultSet
import java.util.UUID

@Repository
class ShopRepository(
    private val jdbcClient: JdbcClient,
) {
    fun create(request: CreateShopRequest): ShopResponse {
        val id = UUID.randomUUID()

        jdbcClient.sql(
            """
            INSERT INTO shops (id, name, address, latitude, longitude, location, phone, place_url, thumbnail_url)
            VALUES (:id, :name, :address, :latitude, :longitude, ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography, :phone, :placeUrl, :thumbnailUrl)
            """.trimIndent(),
        )
            .param("id", id)
            .param("name", request.name)
            .param("address", request.address)
            .param("latitude", request.latitude)
            .param("longitude", request.longitude)
            .param("phone", request.phone)
            .param("placeUrl", request.placeUrl)
            .param("thumbnailUrl", thumbnailUrlOrDefault(request.thumbnailUrl))
            .update()

        replaceTags(id, request.tagNames)
        return findById(id)!!
    }

    fun list(name: String?, visited: Boolean?): List<ShopResponse> =
        jdbcClient.sql(
            """
            SELECT s.*,
              EXISTS (SELECT 1 FROM visits v WHERE v.shop_id = s.id) AS visited,
              EXISTS (SELECT 1 FROM wishlist w WHERE w.shop_id = s.id) AS wishlisted,
              (SELECT AVG(v.overall_rating)::float8 FROM visits v WHERE v.shop_id = s.id) AS average_rating
            FROM shops s
            WHERE (CAST(:name AS text) IS NULL OR lower(s.name) LIKE lower(concat('%', CAST(:name AS text), '%')))
              AND (CAST(:visited AS boolean) IS NULL OR EXISTS (SELECT 1 FROM visits v WHERE v.shop_id = s.id) = CAST(:visited AS boolean))
            ORDER BY s.created_at DESC
            """.trimIndent(),
        )
            .param("name", name)
            .param("visited", visited)
            .query(::mapRecord)
            .list()
            .map(::toResponse)

    fun findById(id: UUID): ShopResponse? =
        jdbcClient.sql(
            """
            SELECT s.*,
              EXISTS (SELECT 1 FROM visits v WHERE v.shop_id = s.id) AS visited,
              EXISTS (SELECT 1 FROM wishlist w WHERE w.shop_id = s.id) AS wishlisted,
              (SELECT AVG(v.overall_rating)::float8 FROM visits v WHERE v.shop_id = s.id) AS average_rating
            FROM shops s
            WHERE s.id = :id
            """.trimIndent(),
        )
            .param("id", id)
            .query(::mapRecord)
            .optional()
            .map(::toResponse)
            .orElse(null)

    fun update(id: UUID, request: UpdateShopRequest): ShopResponse? {
        val updated = jdbcClient.sql(
            """
            UPDATE shops
            SET name = :name,
                address = :address,
                latitude = :latitude,
                longitude = :longitude,
                location = ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography,
                phone = :phone,
                place_url = :placeUrl,
                thumbnail_url = :thumbnailUrl,
                updated_at = now()
            WHERE id = :id
            """.trimIndent(),
        )
            .param("id", id)
            .param("name", request.name)
            .param("address", request.address)
            .param("latitude", request.latitude)
            .param("longitude", request.longitude)
            .param("phone", request.phone)
            .param("placeUrl", request.placeUrl)
            .param("thumbnailUrl", thumbnailUrlOrDefault(request.thumbnailUrl))
            .update()

        if (updated == 0) return null
        replaceTags(id, request.tagNames)
        return findById(id)
    }

    fun delete(id: UUID): Boolean =
        jdbcClient.sql("DELETE FROM shops WHERE id = :id")
            .param("id", id)
            .update() > 0

    fun exists(id: UUID): Boolean =
        jdbcClient.sql("SELECT EXISTS (SELECT 1 FROM shops WHERE id = :id)")
            .param("id", id)
            .query(Boolean::class.java)
            .single()

    private fun replaceTags(shopId: UUID, tagNames: List<String>) {
        jdbcClient.sql("DELETE FROM shop_tags WHERE shop_id = :shopId")
            .param("shopId", shopId)
            .update()

        tagNames.map(String::trim)
            .filter(String::isNotBlank)
            .distinct()
            .forEach { tagName ->
                val tagId = findOrCreateTag(tagName)
                jdbcClient.sql("INSERT INTO shop_tags (shop_id, tag_id) VALUES (:shopId, :tagId) ON CONFLICT DO NOTHING")
                    .param("shopId", shopId)
                    .param("tagId", tagId)
                    .update()
            }
    }

    private fun findOrCreateTag(name: String): UUID {
        val existing = jdbcClient.sql("SELECT id FROM tags WHERE name = :name")
            .param("name", name)
            .query(UUID::class.java)
            .optional()

        if (existing.isPresent) return existing.get()

        val id = UUID.randomUUID()
        jdbcClient.sql("INSERT INTO tags (id, name) VALUES (:id, :name) ON CONFLICT (name) DO NOTHING")
            .param("id", id)
            .param("name", name)
            .update()

        return jdbcClient.sql("SELECT id FROM tags WHERE name = :name")
            .param("name", name)
            .query(UUID::class.java)
            .single()
    }

    private fun toResponse(record: ShopRecord): ShopResponse =
        ShopResponse(
            id = record.id,
            name = record.name,
            address = record.address,
            latitude = record.latitude,
            longitude = record.longitude,
            phone = record.phone,
            placeUrl = record.placeUrl,
            thumbnailUrl = record.thumbnailUrl,
            tags = loadTags(record.id),
            visited = record.visited,
            wishlisted = record.wishlisted,
            averageRating = record.averageRating,
        )

    private fun loadTags(shopId: UUID): List<String> =
        jdbcClient.sql(
            """
            SELECT t.name
            FROM tags t
            JOIN shop_tags st ON st.tag_id = t.id
            WHERE st.shop_id = :shopId
            ORDER BY t.name
            """.trimIndent(),
        )
            .param("shopId", shopId)
            .query(String::class.java)
            .list()

    @Suppress("UNUSED_PARAMETER")
    private fun mapRecord(rs: ResultSet, rowNumber: Int): ShopRecord {
        val averageRating = rs.getNullableDouble("average_rating")
        return ShopRecord(
            id = rs.getObject("id", UUID::class.java),
            name = rs.getString("name"),
            address = rs.getString("address"),
            latitude = rs.getDouble("latitude"),
            longitude = rs.getDouble("longitude"),
            phone = rs.getString("phone"),
            placeUrl = rs.getString("place_url"),
            thumbnailUrl = rs.getString("thumbnail_url"),
            visited = rs.getBoolean("visited"),
            wishlisted = rs.getBoolean("wishlisted"),
            averageRating = averageRating,
        )
    }

    private fun ResultSet.getNullableDouble(column: String): Double? {
        val value = getDouble(column)
        return if (wasNull()) null else value
    }

    private fun thumbnailUrlOrDefault(thumbnailUrl: String?): String =
        thumbnailUrl?.takeIf(String::isNotBlank) ?: DEFAULT_THUMBNAIL_URL

    companion object {
        const val DEFAULT_THUMBNAIL_URL = "/assets/default-ramen.svg"
    }
}
