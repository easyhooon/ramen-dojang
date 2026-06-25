package com.ramendojang.wishlist.dto

import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.NotNull
import java.util.UUID

@Schema(description = "위시리스트 등록 요청")
data class CreateWishlistRequest(
    @field:NotNull(message = "Shop id is required.")
    @field:Schema(description = "위시리스트에 추가할 라멘집 ID", example = "018f8f8e-85b2-7f92-8f11-706d5b4a6601")
    val shopId: UUID,
    @field:Schema(description = "위시리스트 메모", example = "주말 점심에 가보기", nullable = true)
    val note: String? = null,
)
