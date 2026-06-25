package com.ramendojang.visit

import com.ramendojang.visit.dto.CreateVisitRequest
import com.ramendojang.visit.dto.UpdateVisitRequest
import com.ramendojang.visit.dto.VisitResponse
import org.springframework.jdbc.core.simple.JdbcClient
import org.springframework.stereotype.Repository
import java.sql.ResultSet
import java.time.LocalDate
import java.util.UUID

@Repository
class VisitRepository(
    private val jdbcClient: JdbcClient,
) {
    fun create(request: CreateVisitRequest): VisitResponse {
        val id = UUID.randomUUID()

        jdbcClient.sql(
            """
            INSERT INTO visits (
              id, shop_id, visited_at, menu_name, broth_rating, noodle_rating,
              topping_rating, overall_rating, revisit_intention, memo
            )
            VALUES (
              :id, :shopId, :visitedAt, :menuName, :brothRating, :noodleRating,
              :toppingRating, :overallRating, :revisitIntention, :memo
            )
            """.trimIndent(),
        )
            .param("id", id)
            .param("shopId", request.shopId)
            .param("visitedAt", request.visitedAt)
            .param("menuName", request.menuName)
            .param("brothRating", request.brothRating)
            .param("noodleRating", request.noodleRating)
            .param("toppingRating", request.toppingRating)
            .param("overallRating", request.overallRating)
            .param("revisitIntention", request.revisitIntention)
            .param("memo", request.memo)
            .update()

        return findById(id)!!
    }

    fun list(): List<VisitResponse> =
        jdbcClient.sql(baseSelect() + " ORDER BY v.visited_at DESC, v.created_at DESC")
            .query(::mapResponse)
            .list()

    fun listByShop(shopId: UUID): List<VisitResponse> =
        jdbcClient.sql(baseSelect() + " WHERE v.shop_id = :shopId ORDER BY v.visited_at DESC, v.created_at DESC")
            .param("shopId", shopId)
            .query(::mapResponse)
            .list()

    fun findById(id: UUID): VisitResponse? =
        jdbcClient.sql(baseSelect() + " WHERE v.id = :id")
            .param("id", id)
            .query(::mapResponse)
            .optional()
            .orElse(null)

    fun update(id: UUID, request: UpdateVisitRequest): VisitResponse? {
        val updated = jdbcClient.sql(
            """
            UPDATE visits
            SET shop_id = :shopId,
                visited_at = :visitedAt,
                menu_name = :menuName,
                broth_rating = :brothRating,
                noodle_rating = :noodleRating,
                topping_rating = :toppingRating,
                overall_rating = :overallRating,
                revisit_intention = :revisitIntention,
                memo = :memo,
                updated_at = now()
            WHERE id = :id
            """.trimIndent(),
        )
            .param("id", id)
            .param("shopId", request.shopId)
            .param("visitedAt", request.visitedAt)
            .param("menuName", request.menuName)
            .param("brothRating", request.brothRating)
            .param("noodleRating", request.noodleRating)
            .param("toppingRating", request.toppingRating)
            .param("overallRating", request.overallRating)
            .param("revisitIntention", request.revisitIntention)
            .param("memo", request.memo)
            .update()

        if (updated == 0) return null
        return findById(id)
    }

    fun delete(id: UUID): Boolean =
        jdbcClient.sql("DELETE FROM visits WHERE id = :id")
            .param("id", id)
            .update() > 0

    private fun baseSelect(): String =
        """
        SELECT v.*, s.name AS shop_name
        FROM visits v
        JOIN shops s ON s.id = v.shop_id
        """.trimIndent()

    @Suppress("UNUSED_PARAMETER")
    private fun mapResponse(rs: ResultSet, rowNumber: Int): VisitResponse =
        VisitResponse(
            id = rs.getObject("id", UUID::class.java),
            shopId = rs.getObject("shop_id", UUID::class.java),
            shopName = rs.getString("shop_name"),
            visitedAt = rs.getObject("visited_at", LocalDate::class.java),
            menuName = rs.getString("menu_name"),
            brothRating = rs.getInt("broth_rating"),
            noodleRating = rs.getInt("noodle_rating"),
            toppingRating = rs.getInt("topping_rating"),
            overallRating = rs.getInt("overall_rating"),
            revisitIntention = rs.getBoolean("revisit_intention"),
            memo = rs.getString("memo"),
        )
}
