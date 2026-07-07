package com.ramendojang.shop.dto

import io.swagger.v3.oas.annotations.media.Schema
import java.util.UUID

@Schema(description = "라멘집 응답")
data class ShopResponse(
    @field:Schema(description = "라멘집 ID", example = "018f8f8e-85b2-7f92-8f11-706d5b4a6601")
    val id: UUID,
    @field:Schema(description = "라멘집 이름", example = "멘야하나비")
    val name: String,
    @field:Schema(description = "라멘집 주소", example = "서울특별시 마포구 와우산로 1")
    val address: String,
    @field:Schema(description = "위도", example = "37.5665")
    val latitude: Double,
    @field:Schema(description = "경도", example = "126.978")
    val longitude: Double,
    @field:Schema(description = "전화번호", example = "02-123-4567", nullable = true)
    val phone: String?,
    @field:Schema(description = "지도 또는 장소 상세 URL", example = "https://map.naver.com", nullable = true)
    val placeUrl: String?,
    @field:Schema(description = "대표 썸네일 URL", example = "/assets/default-ramen.png")
    val thumbnailUrl: String,
    @field:Schema(description = "라멘집 분류 태그 이름 목록", example = "[\"라멘\", \"일본식라면\"]")
    val tags: List<String>,
    @field:Schema(description = "현재 사용자 기준 방문 여부", example = "true")
    val visited: Boolean,
    @field:Schema(description = "현재 사용자 기준 위시리스트 등록 여부", example = "false")
    val wishlisted: Boolean,
    @field:Schema(description = "현재 사용자 기준 평균 종합 평점", example = "4.3", nullable = true)
    val averageRating: Double?,
)
