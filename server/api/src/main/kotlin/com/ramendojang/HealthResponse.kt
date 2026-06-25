package com.ramendojang

import io.swagger.v3.oas.annotations.media.Schema

@Schema(description = "API health check response")
data class HealthResponse(
    @field:Schema(description = "API status", example = "ok")
    val status: String,
)

