package com.ramendojang.wishlist.dto

import jakarta.validation.constraints.NotNull
import java.util.UUID

data class CreateWishlistRequest(
    @field:NotNull(message = "Shop id is required.")
    val shopId: UUID,
    val note: String? = null,
)

