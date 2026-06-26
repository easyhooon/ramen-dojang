package com.ramendojang.shop

import java.util.UUID

data class ShopRecord(
    val id: UUID,
    val name: String,
    val address: String,
    val latitude: Double,
    val longitude: Double,
    val phone: String?,
    val placeUrl: String?,
    val thumbnailUrl: String,
    val visited: Boolean,
    val wishlisted: Boolean,
    val averageRating: Double?,
)
