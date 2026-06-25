package com.ramendojang.wishlist

import com.ramendojang.wishlist.dto.CreateWishlistRequest
import com.ramendojang.wishlist.dto.WishlistResponse
import org.springframework.jdbc.core.simple.JdbcClient
import org.springframework.stereotype.Repository
import java.sql.ResultSet
import java.time.Instant
import java.util.UUID

@Repository
class WishlistRepository(
    private val jdbcClient: JdbcClient,
) {
    fun upsert(request: CreateWishlistRequest): WishlistResponse {
        jdbcClient.sql(
            """
            INSERT INTO wishlist (id, shop_id, note)
            VALUES (:id, :shopId, :note)
            ON CONFLICT (shop_id) DO UPDATE SET note = EXCLUDED.note
            """.trimIndent(),
        )
            .param("id", UUID.randomUUID())
            .param("shopId", request.shopId)
            .param("note", request.note)
            .update()

        return findByShopId(request.shopId)!!
    }

    fun list(): List<WishlistResponse> =
        jdbcClient.sql(baseSelect() + " ORDER BY w.created_at DESC")
            .query(::mapResponse)
            .list()

    fun delete(shopId: UUID): Boolean =
        jdbcClient.sql("DELETE FROM wishlist WHERE shop_id = :shopId")
            .param("shopId", shopId)
            .update() > 0

    private fun findByShopId(shopId: UUID): WishlistResponse? =
        jdbcClient.sql(baseSelect() + " WHERE w.shop_id = :shopId")
            .param("shopId", shopId)
            .query(::mapResponse)
            .optional()
            .orElse(null)

    private fun baseSelect(): String =
        """
        SELECT w.shop_id, s.name AS shop_name, w.note, w.created_at
        FROM wishlist w
        JOIN shops s ON s.id = w.shop_id
        """.trimIndent()

    @Suppress("UNUSED_PARAMETER")
    private fun mapResponse(rs: ResultSet, rowNumber: Int): WishlistResponse =
        WishlistResponse(
            shopId = rs.getObject("shop_id", UUID::class.java),
            shopName = rs.getString("shop_name"),
            note = rs.getString("note"),
            createdAt = rs.getTimestamp("created_at").toInstant(),
        )
}
