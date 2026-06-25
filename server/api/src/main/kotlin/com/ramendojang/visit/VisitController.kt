package com.ramendojang.visit

import com.ramendojang.common.ErrorResponse
import com.ramendojang.visit.dto.CreateVisitRequest
import com.ramendojang.visit.dto.UpdateVisitRequest
import com.ramendojang.visit.dto.VisitResponse
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
import org.springframework.web.bind.annotation.RestController
import java.net.URI
import java.util.UUID

@RestController
@Tag(name = "Visits", description = "라멘집 방문 기록 등록, 조회, 수정, 삭제")
class VisitController(
    private val visitService: VisitService,
) {
    @Operation(
        operationId = "createVisit",
        summary = "방문 기록 등록",
        description = "특정 라멘집에서 먹은 메뉴와 평점을 기록합니다.",
    )
    @ApiResponses(
        value = [
            ApiResponse(
                responseCode = "201",
                description = "방문 기록이 등록되었습니다.",
                content = [Content(schema = Schema(implementation = VisitResponse::class))],
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
    @PostMapping("/visits")
    fun create(@Valid @RequestBody request: CreateVisitRequest): ResponseEntity<VisitResponse> {
        val visit = visitService.create(request)
        return ResponseEntity.created(URI.create("/visits/${visit.id}")).body(visit)
    }

    @Operation(
        operationId = "listVisits",
        summary = "방문 기록 목록 조회",
        description = "전체 방문 기록을 최신 방문일 순으로 조회합니다.",
    )
    @ApiResponse(
        responseCode = "200",
        description = "방문 기록 목록입니다.",
        content = [Content(array = ArraySchema(schema = Schema(implementation = VisitResponse::class)))],
    )
    @GetMapping("/visits")
    fun list(): List<VisitResponse> = visitService.list()

    @Operation(
        operationId = "getVisit",
        summary = "방문 기록 상세 조회",
        description = "방문 기록 ID로 상세 정보를 조회합니다.",
    )
    @ApiResponses(
        value = [
            ApiResponse(
                responseCode = "200",
                description = "방문 기록 상세 정보입니다.",
                content = [Content(schema = Schema(implementation = VisitResponse::class))],
            ),
            ApiResponse(
                responseCode = "404",
                description = "방문 기록을 찾을 수 없습니다.",
                content = [Content(schema = Schema(implementation = ErrorResponse::class))],
            ),
        ],
    )
    @GetMapping("/visits/{visitId}")
    fun get(
        @Parameter(description = "방문 기록 ID")
        @PathVariable visitId: UUID,
    ): VisitResponse = visitService.get(visitId)

    @Operation(
        operationId = "updateVisit",
        summary = "방문 기록 수정",
        description = "방문일, 메뉴, 평점, 메모를 수정합니다.",
    )
    @ApiResponses(
        value = [
            ApiResponse(
                responseCode = "200",
                description = "수정된 방문 기록입니다.",
                content = [Content(schema = Schema(implementation = VisitResponse::class))],
            ),
            ApiResponse(
                responseCode = "400",
                description = "요청 값이 올바르지 않습니다.",
                content = [Content(schema = Schema(implementation = ErrorResponse::class))],
            ),
            ApiResponse(
                responseCode = "404",
                description = "방문 기록 또는 라멘집을 찾을 수 없습니다.",
                content = [Content(schema = Schema(implementation = ErrorResponse::class))],
            ),
        ],
    )
    @PutMapping("/visits/{visitId}")
    fun update(
        @Parameter(description = "방문 기록 ID")
        @PathVariable visitId: UUID,
        @Valid @RequestBody request: UpdateVisitRequest,
    ): VisitResponse = visitService.update(visitId, request)

    @Operation(
        operationId = "deleteVisit",
        summary = "방문 기록 삭제",
        description = "방문 기록을 삭제합니다.",
    )
    @ApiResponses(
        value = [
            ApiResponse(responseCode = "204", description = "방문 기록이 삭제되었습니다."),
            ApiResponse(
                responseCode = "404",
                description = "방문 기록을 찾을 수 없습니다.",
                content = [Content(schema = Schema(implementation = ErrorResponse::class))],
            ),
        ],
    )
    @DeleteMapping("/visits/{visitId}")
    fun delete(
        @Parameter(description = "방문 기록 ID")
        @PathVariable visitId: UUID,
    ): ResponseEntity<Void> {
        visitService.delete(visitId)
        return ResponseEntity.noContent().build()
    }

    @Operation(
        operationId = "listShopVisits",
        summary = "라멘집별 방문 기록 조회",
        description = "특정 라멘집에 연결된 방문 기록을 조회합니다.",
    )
    @ApiResponses(
        value = [
            ApiResponse(
                responseCode = "200",
                description = "라멘집 방문 기록 목록입니다.",
                content = [Content(array = ArraySchema(schema = Schema(implementation = VisitResponse::class)))],
            ),
            ApiResponse(
                responseCode = "404",
                description = "라멘집을 찾을 수 없습니다.",
                content = [Content(schema = Schema(implementation = ErrorResponse::class))],
            ),
        ],
    )
    @GetMapping("/shops/{shopId}/visits")
    fun listByShop(
        @Parameter(description = "라멘집 ID")
        @PathVariable shopId: UUID,
    ): List<VisitResponse> = visitService.listByShop(shopId)
}
