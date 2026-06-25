package com.ramendojang.visit

import com.ramendojang.common.ApiException
import com.ramendojang.shop.ShopService
import com.ramendojang.visit.dto.CreateVisitRequest
import com.ramendojang.visit.dto.UpdateVisitRequest
import com.ramendojang.visit.dto.VisitResponse
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class VisitService(
    private val visitRepository: VisitRepository,
    private val shopService: ShopService,
) {
    fun create(request: CreateVisitRequest): VisitResponse {
        shopService.ensureExists(request.shopId)
        return visitRepository.create(request)
    }

    fun list(): List<VisitResponse> = visitRepository.list()

    fun listByShop(shopId: UUID): List<VisitResponse> {
        shopService.ensureExists(shopId)
        return visitRepository.listByShop(shopId)
    }

    fun get(id: UUID): VisitResponse =
        visitRepository.findById(id) ?: throw notFound()

    fun update(id: UUID, request: UpdateVisitRequest): VisitResponse {
        shopService.ensureExists(request.shopId)
        return visitRepository.update(id, request) ?: throw notFound()
    }

    fun delete(id: UUID) {
        if (!visitRepository.delete(id)) throw notFound()
    }

    private fun notFound(): ApiException =
        ApiException("VISIT_NOT_FOUND", "Visit was not found.", HttpStatus.NOT_FOUND)
}

