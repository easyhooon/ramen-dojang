package com.ramendojang.visit

import com.ramendojang.visit.dto.CreateVisitRequest
import com.ramendojang.visit.dto.UpdateVisitRequest
import com.ramendojang.visit.dto.VisitResponse
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
class VisitController(
    private val visitService: VisitService,
) {
    @PostMapping("/visits")
    fun create(@Valid @RequestBody request: CreateVisitRequest): ResponseEntity<VisitResponse> {
        val visit = visitService.create(request)
        return ResponseEntity.created(URI.create("/visits/${visit.id}")).body(visit)
    }

    @GetMapping("/visits")
    fun list(): List<VisitResponse> = visitService.list()

    @GetMapping("/visits/{visitId}")
    fun get(@PathVariable visitId: UUID): VisitResponse = visitService.get(visitId)

    @PutMapping("/visits/{visitId}")
    fun update(
        @PathVariable visitId: UUID,
        @Valid @RequestBody request: UpdateVisitRequest,
    ): VisitResponse = visitService.update(visitId, request)

    @DeleteMapping("/visits/{visitId}")
    fun delete(@PathVariable visitId: UUID): ResponseEntity<Void> {
        visitService.delete(visitId)
        return ResponseEntity.noContent().build()
    }

    @GetMapping("/shops/{shopId}/visits")
    fun listByShop(@PathVariable shopId: UUID): List<VisitResponse> = visitService.listByShop(shopId)
}

