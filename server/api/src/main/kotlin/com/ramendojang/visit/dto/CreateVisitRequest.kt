package com.ramendojang.visit.dto

import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import java.time.LocalDate
import java.util.UUID

@Schema(description = "방문 기록 등록 요청")
data class CreateVisitRequest(
    @field:NotNull(message = "Shop id is required.")
    @field:Schema(description = "방문한 라멘집 ID", example = "018f8f8e-85b2-7f92-8f11-706d5b4a6601")
    val shopId: UUID,
    @field:NotNull(message = "Visited date is required.")
    @field:Schema(description = "방문일", example = "2026-06-25")
    val visitedAt: LocalDate,
    @field:NotBlank(message = "Menu name is required.")
    @field:Schema(description = "먹은 메뉴 이름", example = "쇼유라멘")
    val menuName: String,
    @field:Min(1)
    @field:Max(5)
    @field:Schema(description = "국물 평점, 1에서 5 사이", example = "4", minimum = "1", maximum = "5")
    val brothRating: Int,
    @field:Min(1)
    @field:Max(5)
    @field:Schema(description = "면 평점, 1에서 5 사이", example = "5", minimum = "1", maximum = "5")
    val noodleRating: Int,
    @field:Min(1)
    @field:Max(5)
    @field:Schema(description = "토핑 평점, 1에서 5 사이", example = "4", minimum = "1", maximum = "5")
    val toppingRating: Int,
    @field:Min(1)
    @field:Max(5)
    @field:Schema(description = "종합 평점, 1에서 5 사이", example = "4", minimum = "1", maximum = "5")
    val overallRating: Int,
    @field:Schema(description = "재방문 의사", example = "true")
    val revisitIntention: Boolean,
    @field:Schema(description = "방문 메모", example = "국물이 진하고 면 식감이 좋았다.", nullable = true)
    val memo: String? = null,
)
