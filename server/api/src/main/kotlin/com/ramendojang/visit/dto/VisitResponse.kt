package com.ramendojang.visit.dto

import io.swagger.v3.oas.annotations.media.Schema
import java.time.LocalDate
import java.util.UUID

@Schema(description = "방문 기록 응답")
data class VisitResponse(
    @field:Schema(description = "방문 기록 ID", example = "018f8f8e-85b2-7f92-8f11-706d5b4a6602")
    val id: UUID,
    @field:Schema(description = "라멘집 ID", example = "018f8f8e-85b2-7f92-8f11-706d5b4a6601")
    val shopId: UUID,
    @field:Schema(description = "라멘집 이름", example = "멘야하나비")
    val shopName: String,
    @field:Schema(description = "방문일", example = "2026-06-25")
    val visitedAt: LocalDate,
    @field:Schema(description = "먹은 메뉴 이름", example = "쇼유라멘")
    val menuName: String,
    @field:Schema(description = "국물 평점", example = "4")
    val brothRating: Int,
    @field:Schema(description = "면 평점", example = "5")
    val noodleRating: Int,
    @field:Schema(description = "토핑 평점", example = "4")
    val toppingRating: Int,
    @field:Schema(description = "종합 평점", example = "4")
    val overallRating: Int,
    @field:Schema(description = "재방문 의사", example = "true")
    val revisitIntention: Boolean,
    @field:Schema(description = "방문 메모", example = "국물이 진하고 면 식감이 좋았다.", nullable = true)
    val memo: String?,
)
