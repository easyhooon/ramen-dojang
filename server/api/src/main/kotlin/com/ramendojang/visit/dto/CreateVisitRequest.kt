package com.ramendojang.visit.dto

import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import java.time.LocalDate
import java.util.UUID

data class CreateVisitRequest(
    @field:NotNull(message = "Shop id is required.")
    val shopId: UUID,
    @field:NotNull(message = "Visited date is required.")
    val visitedAt: LocalDate,
    @field:NotBlank(message = "Menu name is required.")
    val menuName: String,
    @field:Min(1)
    @field:Max(5)
    val brothRating: Int,
    @field:Min(1)
    @field:Max(5)
    val noodleRating: Int,
    @field:Min(1)
    @field:Max(5)
    val toppingRating: Int,
    @field:Min(1)
    @field:Max(5)
    val overallRating: Int,
    val revisitIntention: Boolean,
    val memo: String? = null,
)

