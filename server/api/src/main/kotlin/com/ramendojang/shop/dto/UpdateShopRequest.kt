package com.ramendojang.shop.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull

data class UpdateShopRequest(
    @field:NotBlank(message = "Shop name is required.")
    val name: String,
    @field:NotBlank(message = "Address is required.")
    val address: String,
    @field:NotNull(message = "Latitude is required.")
    val latitude: Double,
    @field:NotNull(message = "Longitude is required.")
    val longitude: Double,
    val phone: String? = null,
    val placeUrl: String? = null,
    val tagNames: List<String> = emptyList(),
)

