package com.ramendojang.common

import io.swagger.v3.oas.annotations.media.Schema

@Schema(description = "Common API error response")
data class ErrorResponse(
    @field:Schema(description = "Machine-readable error code", example = "SHOP_NOT_FOUND")
    val code: String,
    @field:Schema(description = "Human-readable error message", example = "Shop was not found.")
    val message: String,
)
