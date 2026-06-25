package com.ramendojang.visit.dto

import java.time.LocalDate
import java.util.UUID

data class VisitResponse(
    val id: UUID,
    val shopId: UUID,
    val shopName: String,
    val visitedAt: LocalDate,
    val menuName: String,
    val brothRating: Int,
    val noodleRating: Int,
    val toppingRating: Int,
    val overallRating: Int,
    val revisitIntention: Boolean,
    val memo: String?,
)

