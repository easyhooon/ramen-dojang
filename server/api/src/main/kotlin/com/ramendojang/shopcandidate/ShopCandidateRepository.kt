package com.ramendojang.shopcandidate

import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.jdbc.core.simple.JdbcClient
import org.springframework.stereotype.Repository
import java.sql.ResultSet
import java.util.UUID

@Repository
class ShopCandidateRepository(
    private val jdbcClient: JdbcClient,
    private val objectMapper: ObjectMapper,
) {
    fun upsert(candidate: UpsertShopCandidate): ShopCandidateResponse {
        val id = UUID.randomUUID()

        return jdbcClient.sql(
            """
            INSERT INTO shop_candidates (
              id, source, source_place_id, raw_name, normalized_name, category, address,
              latitude, longitude, confidence_score, raw_payload
            )
            VALUES (
              :id, :source, :sourcePlaceId, :rawName, :normalizedName, :category, :address,
              :latitude, :longitude, :confidenceScore, CAST(:rawPayload AS jsonb)
            )
            ON CONFLICT (source, source_place_id) WHERE source_place_id IS NOT NULL
            DO UPDATE SET
              raw_name = EXCLUDED.raw_name,
              normalized_name = EXCLUDED.normalized_name,
              category = EXCLUDED.category,
              address = EXCLUDED.address,
              latitude = EXCLUDED.latitude,
              longitude = EXCLUDED.longitude,
              confidence_score = EXCLUDED.confidence_score,
              raw_payload = EXCLUDED.raw_payload,
              last_seen_at = now(),
              updated_at = now()
            RETURNING id, source, source_place_id, raw_name, normalized_name, category, address,
              latitude, longitude, confidence_score, status
            """.trimIndent(),
        )
            .param("id", id)
            .param("source", candidate.source)
            .param("sourcePlaceId", candidate.sourcePlaceId)
            .param("rawName", candidate.rawName)
            .param("normalizedName", candidate.normalizedName)
            .param("category", candidate.category)
            .param("address", candidate.address)
            .param("latitude", candidate.latitude)
            .param("longitude", candidate.longitude)
            .param("confidenceScore", candidate.confidenceScore)
            .param("rawPayload", objectMapper.writeValueAsString(candidate.rawPayload))
            .query(::map)
            .single()
    }

    @Suppress("UNUSED_PARAMETER")
    private fun map(rs: ResultSet, rowNumber: Int): ShopCandidateResponse {
        return ShopCandidateResponse(
            id = rs.getObject("id", UUID::class.java),
            source = rs.getString("source"),
            sourcePlaceId = rs.getString("source_place_id"),
            rawName = rs.getString("raw_name"),
            normalizedName = rs.getString("normalized_name"),
            category = rs.getString("category"),
            address = rs.getString("address"),
            latitude = rs.getNullableDouble("latitude"),
            longitude = rs.getNullableDouble("longitude"),
            confidenceScore = rs.getNullableDouble("confidence_score"),
            status = rs.getString("status"),
        )
    }

    private fun ResultSet.getNullableDouble(column: String): Double? {
        val value = getDouble(column)
        return if (wasNull()) null else value
    }
}
