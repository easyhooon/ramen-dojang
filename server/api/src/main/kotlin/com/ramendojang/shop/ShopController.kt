package com.ramendojang.shop

import com.ramendojang.common.ErrorResponse
import com.ramendojang.shop.dto.CreateShopRequest
import com.ramendojang.shop.dto.ShopResponse
import com.ramendojang.shop.dto.UpdateShopRequest
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
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.net.URI
import java.util.UUID

@RestController
@RequestMapping("/shops")
@Tag(name = "Shops", description = "라멘집 등록, 조회, 수정, 삭제")
class ShopController(
    private val shopService: ShopService,
) {
    @Operation(
        operationId = "createShop",
        summary = "라멘집 등록",
        description = "방문했거나 방문할 라멘집을 등록합니다.",
    )
    @ApiResponses(
        value = [
            ApiResponse(
                responseCode = "201",
                description = "라멘집이 등록되었습니다.",
                content = [Content(schema = Schema(implementation = ShopResponse::class))],
            ),
            ApiResponse(
                responseCode = "400",
                description = "요청 값이 올바르지 않습니다.",
                content = [Content(schema = Schema(implementation = ErrorResponse::class))],
            ),
        ],
    )
    @PostMapping
    fun create(@Valid @RequestBody request: CreateShopRequest): ResponseEntity<ShopResponse> {
        val shop = shopService.create(request)
        return ResponseEntity.created(URI.create("/shops/${shop.id}")).body(shop)
    }

    @Operation(
        operationId = "listShops",
        summary = "라멘집 목록 조회",
        description = "이름, 태그, 방문 여부로 라멘집 목록을 조회합니다.",
    )
    @ApiResponse(
        responseCode = "200",
        description = "라멘집 목록입니다.",
        content = [Content(array = ArraySchema(schema = Schema(implementation = ShopResponse::class)))],
    )
    @GetMapping
    fun list(
        @Parameter(description = "라멘집 이름 검색어", example = "멘야")
        @RequestParam(required = false) name: String?,
        @Parameter(description = "태그 이름", example = "쇼유")
        @RequestParam(required = false) tag: String?,
        @Parameter(description = "방문 여부")
        @RequestParam(required = false) visited: Boolean?,
    ): List<ShopResponse> = shopService.list(name = name, tag = tag, visited = visited)

    @Operation(
        operationId = "getShop",
        summary = "라멘집 상세 조회",
        description = "라멘집 ID로 상세 정보를 조회합니다.",
    )
    @ApiResponses(
        value = [
            ApiResponse(
                responseCode = "200",
                description = "라멘집 상세 정보입니다.",
                content = [Content(schema = Schema(implementation = ShopResponse::class))],
            ),
            ApiResponse(
                responseCode = "404",
                description = "라멘집을 찾을 수 없습니다.",
                content = [Content(schema = Schema(implementation = ErrorResponse::class))],
            ),
        ],
    )
    @GetMapping("/{shopId}")
    fun get(
        @Parameter(description = "라멘집 ID")
        @PathVariable shopId: UUID,
    ): ShopResponse = shopService.get(shopId)

    @Operation(
        operationId = "updateShop",
        summary = "라멘집 수정",
        description = "라멘집 기본 정보와 태그를 수정합니다.",
    )
    @ApiResponses(
        value = [
            ApiResponse(
                responseCode = "200",
                description = "수정된 라멘집 정보입니다.",
                content = [Content(schema = Schema(implementation = ShopResponse::class))],
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
    @PutMapping("/{shopId}")
    fun update(
        @Parameter(description = "라멘집 ID")
        @PathVariable shopId: UUID,
        @Valid @RequestBody request: UpdateShopRequest,
    ): ShopResponse = shopService.update(shopId, request)

    @Operation(
        operationId = "deleteShop",
        summary = "라멘집 삭제",
        description = "라멘집과 연결된 방문 기록, 태그 연결, 위시리스트 항목을 삭제합니다.",
    )
    @ApiResponses(
        value = [
            ApiResponse(responseCode = "204", description = "라멘집이 삭제되었습니다."),
            ApiResponse(
                responseCode = "404",
                description = "라멘집을 찾을 수 없습니다.",
                content = [Content(schema = Schema(implementation = ErrorResponse::class))],
            ),
        ],
    )
    @DeleteMapping("/{shopId}")
    fun delete(
        @Parameter(description = "라멘집 ID")
        @PathVariable shopId: UUID,
    ): ResponseEntity<Void> {
        shopService.delete(shopId)
        return ResponseEntity.noContent().build()
    }
}
