package com.ramendojang.shopcandidate

data class NaverLocalSearchResponse(
    val items: List<NaverLocalItem> = emptyList(),
)

data class NaverLocalItem(
    val title: String = "",
    val link: String = "",
    val category: String = "",
    val description: String = "",
    val telephone: String = "",
    val address: String = "",
    val roadAddress: String = "",
    val mapx: String = "",
    val mapy: String = "",
)
