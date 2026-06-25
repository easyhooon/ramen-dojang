package com.ramendojang.shop.dto

import java.util.UUID

data class ShopResponse(
    val id: UUID,
    val name: String,
    val address: String,
    val latitude: Double,
    val longitude: Double,
    val phone: String?,
    val placeUrl: String?,
    val tags: List<String>,
    val visited: Boolean,
    val wishlisted: Boolean,
    val averageRating: Double?,
)

