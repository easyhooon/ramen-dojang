package com.ramendojang.wishlist.dto

import io.swagger.v3.oas.annotations.media.Schema
import java.time.Instant
import java.util.UUID

@Schema(description = "위시리스트 응답")
data class WishlistResponse(
    @field:Schema(description = "라멘집 ID", example = "018f8f8e-85b2-7f92-8f11-706d5b4a6601")
    val shopId: UUID,
    @field:Schema(description = "라멘집 이름", example = "멘야하나비")
    val shopName: String,
    @field:Schema(description = "위시리스트 메모", example = "주말 점심에 가보기", nullable = true)
    val note: String?,
    @field:Schema(description = "위시리스트 등록일시", example = "2026-06-25T12:00:00Z")
    val createdAt: Instant,
)
