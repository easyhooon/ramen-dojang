package com.ramendojang.shopcandidate

import com.ramendojang.common.ErrorResponse
import com.ramendojang.shop.dto.ShopResponse
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/admin/shop-candidates")
@Tag(name = "Shop Candidates", description = "외부 검색 기반 라멘집 후보 관리")
class ShopCandidateController(
    private val shopCandidateService: ShopCandidateService,
) {
    @Operation(
        operationId = "listShopCandidates",
        summary = "라멘집 후보 목록 조회",
        description = "검수 전후 라멘집 후보를 조회합니다.",
    )
    @GetMapping
    fun list(
        @RequestParam(required = false) status: String?,
    ): List<ShopCandidateResponse> = shopCandidateService.list(status)

    @Operation(
        operationId = "syncShopCandidatesFromNaver",
        summary = "네이버 지역 검색 후보 동기화",
        description = "네이버 지역 검색 결과를 검수 전 후보로 저장합니다. `shops`에는 직접 반영하지 않습니다.",
    )
    @ApiResponses(
        value = [
            ApiResponse(
                responseCode = "200",
                description = "동기화된 후보 목록입니다.",
                content = [Content(schema = Schema(implementation = SyncShopCandidatesResponse::class))],
            ),
            ApiResponse(
                responseCode = "400",
                description = "요청 값이 올바르지 않습니다.",
                content = [Content(schema = Schema(implementation = ErrorResponse::class))],
            ),
            ApiResponse(
                responseCode = "503",
                description = "네이버 검색 API 인증 정보가 설정되지 않았습니다.",
                content = [Content(schema = Schema(implementation = ErrorResponse::class))],
            ),
        ],
    )
    @PostMapping("/sync")
    fun syncFromNaver(
        @Valid @RequestBody request: SyncShopCandidatesRequest,
    ): SyncShopCandidatesResponse = shopCandidateService.syncFromNaver(request)

    @Operation(
        operationId = "promoteShopCandidate",
        summary = "라멘집 후보 승격",
        description = "검수한 후보를 실제 라멘집 catalog인 `shops`에 등록합니다.",
    )
    @ApiResponses(
        value = [
            ApiResponse(
                responseCode = "200",
                description = "승격된 라멘집입니다.",
                content = [Content(schema = Schema(implementation = ShopResponse::class))],
            ),
            ApiResponse(
                responseCode = "404",
                description = "후보를 찾을 수 없습니다.",
                content = [Content(schema = Schema(implementation = ErrorResponse::class))],
            ),
        ],
    )
    @PostMapping("/{candidateId}/promote")
    fun promote(
        @PathVariable candidateId: UUID,
    ): ShopResponse = shopCandidateService.promote(candidateId)
}
