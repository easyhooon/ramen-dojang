package com.ramendojang.wishlist

import com.ramendojang.common.ErrorResponse
import com.ramendojang.wishlist.dto.CreateWishlistRequest
import com.ramendojang.wishlist.dto.WishlistResponse
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.media.ArraySchema
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.net.URI
import java.util.UUID

@RestController
@RequestMapping("/wishlist")
@Tag(name = "Wishlist", description = "가고 싶은 라멘집 관리")
class WishlistController(
    private val wishlistService: WishlistService,
) {
    @Operation(summary = "위시리스트 등록 또는 수정", description = "라멘집을 위시리스트에 추가하거나 메모를 수정합니다.")
    @ApiResponses(
        value = [
            ApiResponse(
                responseCode = "201",
                description = "위시리스트 항목이 저장되었습니다.",
                content = [Content(schema = Schema(implementation = WishlistResponse::class))],
            ),
            ApiResponse(
                responseCode = "400",
                description = "요청 값이 올바르지 않습니다.",
                content = [Content(schema = Schema(implementation = ErrorResponse::class))],
            ),
            ApiResponse(
                responseCode = "404",
                description = "라멘집을 찾을 수 없습니다.",
                content = [Content(schema = Schema(implementation = ErrorResponse::class))],
            ),
        ],
    )
    @PostMapping
    fun upsert(@Valid @RequestBody request: CreateWishlistRequest): ResponseEntity<WishlistResponse> {
        val item = wishlistService.upsert(request)
        return ResponseEntity.created(URI.create("/wishlist/${item.shopId}")).body(item)
    }

    @Operation(summary = "위시리스트 조회", description = "현재 위시리스트 항목을 조회합니다.")
    @ApiResponse(
        responseCode = "200",
        description = "위시리스트 목록입니다.",
        content = [Content(array = ArraySchema(schema = Schema(implementation = WishlistResponse::class)))],
    )
    @GetMapping
    fun list(): List<WishlistResponse> = wishlistService.list()

    @Operation(summary = "위시리스트 삭제", description = "라멘집 ID 기준으로 위시리스트 항목을 삭제합니다.")
    @ApiResponses(
        value = [
            ApiResponse(responseCode = "204", description = "위시리스트 항목이 삭제되었습니다."),
            ApiResponse(
                responseCode = "404",
                description = "위시리스트 항목을 찾을 수 없습니다.",
                content = [Content(schema = Schema(implementation = ErrorResponse::class))],
            ),
        ],
    )
    @DeleteMapping("/{shopId}")
    fun delete(
        @Parameter(description = "라멘집 ID")
        @PathVariable shopId: UUID,
    ): ResponseEntity<Void> {
        wishlistService.delete(shopId)
        return ResponseEntity.noContent().build()
    }
}
