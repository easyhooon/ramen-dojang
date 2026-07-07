package com.ramendojang.shop

import com.ramendojang.common.ApiException
import com.ramendojang.shop.dto.CreateShopRequest
import com.ramendojang.shop.dto.ShopResponse
import com.ramendojang.shop.dto.UpdateShopRequest
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class ShopService(
    private val shopRepository: ShopRepository,
) {
    fun create(request: CreateShopRequest): ShopResponse = shopRepository.create(request)

    fun list(name: String?, visited: Boolean?): List<ShopResponse> =
        shopRepository.list(name = name, visited = visited)

    fun get(id: UUID): ShopResponse =
        shopRepository.findById(id) ?: throw notFound()

    fun update(id: UUID, request: UpdateShopRequest): ShopResponse =
        shopRepository.update(id, request) ?: throw notFound()

    fun delete(id: UUID) {
        if (!shopRepository.delete(id)) throw notFound()
    }

    fun ensureExists(id: UUID) {
        if (!shopRepository.exists(id)) throw notFound()
    }

    private fun notFound(): ApiException =
        ApiException("SHOP_NOT_FOUND", "Shop was not found.", HttpStatus.NOT_FOUND)
}
