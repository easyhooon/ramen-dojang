package com.ramendojang.shopcandidate

import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import java.util.UUID

data class SyncShopCandidatesRequest(
    @field:NotBlank
    val query: String,
    @field:Min(1)
    @field:Max(5)
    val display: Int = 5,
)

data class SyncShopCandidatesResponse(
    val count: Int,
    val candidates: List<ShopCandidateResponse>,
)

data class ShopCandidateResponse(
    val id: UUID,
    val promotedShopId: UUID?,
    val source: String,
    val sourcePlaceId: String?,
    val rawName: String,
    val normalizedName: String,
    val category: String?,
    val address: String,
    val latitude: Double?,
    val longitude: Double?,
    val confidenceScore: Double?,
    val status: String,
)
