package com.ramendojang.seed

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import java.io.FileInputStream
import java.io.InputStream
import java.sql.Connection
import java.sql.DriverManager
import java.util.UUID

private const val DEFAULT_DATABASE_URL = "jdbc:postgresql://localhost:5432/ramen_dojang"
private const val DEFAULT_DATABASE_USERNAME = "ramen"
private const val DEFAULT_DATABASE_PASSWORD = "ramen"
private const val DEFAULT_SEED_RESOURCE = "seed/shops.seed.json"
private const val DEFAULT_THUMBNAIL_URL = "/assets/default-ramen.png"

data class SeedShopRecord(
    val name: String,
    val address: String,
    val latitude: Double,
    val longitude: Double,
    val tags: List<String> = emptyList(),
    val phone: String? = null,
    val placeUrl: String? = null,
    val thumbnailUrl: String? = null,
)

data class SeedImportResult(
    val inserted: Int,
    val updated: Int,
    val total: Int,
)

fun main() {
    val databaseUrl = envOrDefault("DATABASE_URL", DEFAULT_DATABASE_URL)
    val databaseUsername = envOrDefault("DATABASE_USERNAME", DEFAULT_DATABASE_USERNAME)
    val databasePassword = envOrDefault("DATABASE_PASSWORD", DEFAULT_DATABASE_PASSWORD)

    loadSeedShops().use { seedStream ->
        DriverManager.getConnection(databaseUrl, databaseUsername, databasePassword).use { connection ->
            val shops = readSeedShops(seedStream)
            val result = importSeedShops(connection, shops)
            println("Imported seed shops: total=${result.total}, inserted=${result.inserted}, updated=${result.updated}")
        }
    }
}

internal fun readSeedShops(input: InputStream): List<SeedShopRecord> =
    jacksonObjectMapper().readValue(input)

internal fun importSeedShops(
    connection: Connection,
    shops: List<SeedShopRecord>,
): SeedImportResult {
    val previousAutoCommit = connection.autoCommit
    connection.autoCommit = false

    var inserted = 0
    var updated = 0

    try {
        shops.forEach { shop ->
            val existingShopId = findShopId(connection, shop.name, shop.address)
            val shopId = existingShopId ?: UUID.randomUUID()

            if (existingShopId == null) {
                insertShop(connection, shopId, shop)
                inserted += 1
            } else {
                updateShop(connection, shopId, shop)
                updated += 1
            }

            shop.normalizedTags().forEach { tagName ->
                val tagId = findOrCreateTag(connection, tagName)
                attachTag(connection, shopId, tagId)
            }
        }

        connection.commit()
        return SeedImportResult(inserted = inserted, updated = updated, total = shops.size)
    } catch (error: Exception) {
        connection.rollback()
        throw error
    } finally {
        connection.autoCommit = previousAutoCommit
    }
}

private fun loadSeedShops(): InputStream {
    val filePath = System.getenv("SEED_SHOPS_FILE")?.takeIf(String::isNotBlank)
    if (filePath != null) {
        return FileInputStream(filePath)
    }

    return requireNotNull(Thread.currentThread().contextClassLoader.getResourceAsStream(DEFAULT_SEED_RESOURCE)) {
        "Seed resource not found: $DEFAULT_SEED_RESOURCE"
    }
}

private fun envOrDefault(
    name: String,
    defaultValue: String,
): String =
    System.getenv(name)?.takeIf(String::isNotBlank) ?: defaultValue

private fun findShopId(
    connection: Connection,
    name: String,
    address: String,
): UUID? =
    connection.prepareStatement(
        """
        SELECT id
        FROM shops
        WHERE name = ? AND address = ?
        ORDER BY created_at ASC
        LIMIT 1
        """.trimIndent(),
    ).use { statement ->
        statement.setString(1, name)
        statement.setString(2, address)
        statement.executeQuery().use { rs ->
            if (rs.next()) rs.getObject("id", UUID::class.java) else null
        }
    }

private fun insertShop(
    connection: Connection,
    shopId: UUID,
    shop: SeedShopRecord,
) {
    connection.prepareStatement(
        """
        INSERT INTO shops (
          id, name, address, latitude, longitude, location, phone, place_url, thumbnail_url
        )
        VALUES (
          ?, ?, ?, ?, ?, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography, ?, ?, ?
        )
        """.trimIndent(),
    ).use { statement ->
        statement.setObject(1, shopId)
        statement.setString(2, shop.name)
        statement.setString(3, shop.address)
        statement.setDouble(4, shop.latitude)
        statement.setDouble(5, shop.longitude)
        statement.setDouble(6, shop.longitude)
        statement.setDouble(7, shop.latitude)
        statement.setString(8, shop.phone)
        statement.setString(9, shop.placeUrl)
        statement.setString(10, shop.normalizedThumbnailUrl())
        statement.executeUpdate()
    }
}

private fun updateShop(
    connection: Connection,
    shopId: UUID,
    shop: SeedShopRecord,
) {
    connection.prepareStatement(
        """
        UPDATE shops
        SET latitude = ?,
            longitude = ?,
            location = ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography,
            phone = ?,
            place_url = ?,
            thumbnail_url = ?,
            updated_at = now()
        WHERE id = ?
        """.trimIndent(),
    ).use { statement ->
        statement.setDouble(1, shop.latitude)
        statement.setDouble(2, shop.longitude)
        statement.setDouble(3, shop.longitude)
        statement.setDouble(4, shop.latitude)
        statement.setString(5, shop.phone)
        statement.setString(6, shop.placeUrl)
        statement.setString(7, shop.normalizedThumbnailUrl())
        statement.setObject(8, shopId)
        statement.executeUpdate()
    }
}

private fun findOrCreateTag(
    connection: Connection,
    name: String,
): UUID {
    connection.prepareStatement("SELECT id FROM tags WHERE name = ?").use { statement ->
        statement.setString(1, name)
        statement.executeQuery().use { rs ->
            if (rs.next()) return rs.getObject("id", UUID::class.java)
        }
    }

    val tagId = UUID.randomUUID()
    connection.prepareStatement(
        "INSERT INTO tags (id, name) VALUES (?, ?) ON CONFLICT (name) DO NOTHING",
    ).use { statement ->
        statement.setObject(1, tagId)
        statement.setString(2, name)
        statement.executeUpdate()
    }

    connection.prepareStatement("SELECT id FROM tags WHERE name = ?").use { statement ->
        statement.setString(1, name)
        statement.executeQuery().use { rs ->
            require(rs.next()) { "Failed to create tag: $name" }
            return rs.getObject("id", UUID::class.java)
        }
    }
}

private fun attachTag(
    connection: Connection,
    shopId: UUID,
    tagId: UUID,
) {
    connection.prepareStatement(
        "INSERT INTO shop_tags (shop_id, tag_id) VALUES (?, ?) ON CONFLICT DO NOTHING",
    ).use { statement ->
        statement.setObject(1, shopId)
        statement.setObject(2, tagId)
        statement.executeUpdate()
    }
}

private fun SeedShopRecord.normalizedThumbnailUrl(): String =
    thumbnailUrl?.takeIf(String::isNotBlank) ?: DEFAULT_THUMBNAIL_URL

private fun SeedShopRecord.normalizedTags(): List<String> =
    tags.map(String::trim)
        .filter(String::isNotBlank)
        .distinct()
