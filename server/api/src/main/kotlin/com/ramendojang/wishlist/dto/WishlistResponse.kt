package com.ramendojang.wishlist.dto

import java.time.Instant
import java.util.UUID

data class WishlistResponse(
    val shopId: UUID,
    val shopName: String,
    val note: String?,
    val createdAt: Instant,
)

