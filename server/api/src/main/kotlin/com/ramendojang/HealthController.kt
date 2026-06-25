package com.ramendojang

import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@Tag(name = "Health", description = "API health check")
class HealthController {
    @Operation(
        operationId = "getHealth",
        summary = "헬스 체크",
        description = "API 서버가 요청을 받을 수 있는지 확인합니다.",
    )
    @ApiResponse(
        responseCode = "200",
        description = "API server is healthy.",
        content = [Content(schema = Schema(implementation = HealthResponse::class))],
    )
    @GetMapping("/health")
    fun health(): HealthResponse = HealthResponse(status = "ok")
}
