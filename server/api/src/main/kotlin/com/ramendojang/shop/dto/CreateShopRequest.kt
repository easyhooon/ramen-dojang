package com.ramendojang.shop.dto

import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull

@Schema(description = "라멘집 등록 요청")
data class CreateShopRequest(
    @field:NotBlank(message = "Shop name is required.")
    @field:Schema(description = "라멘집 이름", example = "멘야하나비")
    val name: String,
    @field:NotBlank(message = "Address is required.")
    @field:Schema(description = "라멘집 주소", example = "서울특별시 마포구 와우산로 1")
    val address: String,
    @field:NotNull(message = "Latitude is required.")
    @field:Schema(description = "위도", example = "37.5665")
    val latitude: Double,
    @field:NotNull(message = "Longitude is required.")
    @field:Schema(description = "경도", example = "126.978")
    val longitude: Double,
    @field:Schema(description = "전화번호", example = "02-123-4567", nullable = true)
    val phone: String? = null,
    @field:Schema(description = "지도 또는 장소 상세 URL", example = "https://map.naver.com", nullable = true)
    val placeUrl: String? = null,
    @field:Schema(description = "대표 썸네일 URL", example = "/assets/default-ramen.svg")
    val thumbnailUrl: String? = null,
    @field:Schema(description = "라멘 스타일 태그 이름 목록", example = "[\"쇼유\", \"이에케이\"]")
    val tagNames: List<String> = emptyList(),
)
