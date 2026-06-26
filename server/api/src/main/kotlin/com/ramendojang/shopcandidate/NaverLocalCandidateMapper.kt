package com.ramendojang.shopcandidate

import java.math.BigDecimal

object NaverLocalCandidateMapper {
    fun toCandidate(item: NaverLocalItem): UpsertShopCandidate {
        val normalizedName = clean(item.title)
        val address = item.roadAddress.ifBlank { item.address }

        return UpsertShopCandidate(
            source = "naver_search_local",
            sourcePlaceId = item.link.ifBlank { "$normalizedName|$address" },
            rawName = item.title,
            normalizedName = normalizedName,
            category = item.category.ifBlank { null },
            address = address,
            latitude = coordinate(item.mapy),
            longitude = coordinate(item.mapx),
            // ponytail: naive score, replace with review/ranking data when candidates grow.
            confidenceScore = score(normalizedName, item.category),
            rawPayload = item,
        )
    }

    fun clean(value: String): String =
        value.replace(Regex("<[^>]+>"), "")
            .replace("&amp;", "&")
            .trim()

    fun coordinate(value: String): Double? =
        value.toDoubleOrNull()
            ?.takeIf { it > 10_000_000 }
            ?.div(10_000_000)

    private fun score(name: String, category: String): BigDecimal =
        when {
            name.contains("라멘") -> BigDecimal("0.9000")
            category.contains("일식") -> BigDecimal("0.7000")
            else -> BigDecimal("0.5000")
        }
}

data class UpsertShopCandidate(
    val source: String,
    val sourcePlaceId: String,
    val rawName: String,
    val normalizedName: String,
    val category: String?,
    val address: String,
    val latitude: Double?,
    val longitude: Double?,
    val confidenceScore: BigDecimal,
    val rawPayload: Any,
)
