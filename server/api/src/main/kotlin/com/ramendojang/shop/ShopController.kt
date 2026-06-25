package com.ramendojang.shop

import com.ramendojang.shop.dto.CreateShopRequest
import com.ramendojang.shop.dto.ShopResponse
import com.ramendojang.shop.dto.UpdateShopRequest
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
class ShopController(
    private val shopService: ShopService,
) {
    @PostMapping
    fun create(@Valid @RequestBody request: CreateShopRequest): ResponseEntity<ShopResponse> {
        val shop = shopService.create(request)
        return ResponseEntity.created(URI.create("/shops/${shop.id}")).body(shop)
    }

    @GetMapping
    fun list(
        @RequestParam(required = false) name: String?,
        @RequestParam(required = false) tag: String?,
        @RequestParam(required = false) visited: Boolean?,
    ): List<ShopResponse> = shopService.list(name = name, tag = tag, visited = visited)

    @GetMapping("/{shopId}")
    fun get(@PathVariable shopId: UUID): ShopResponse = shopService.get(shopId)

    @PutMapping("/{shopId}")
    fun update(
        @PathVariable shopId: UUID,
        @Valid @RequestBody request: UpdateShopRequest,
    ): ShopResponse = shopService.update(shopId, request)

    @DeleteMapping("/{shopId}")
    fun delete(@PathVariable shopId: UUID): ResponseEntity<Void> {
        shopService.delete(shopId)
        return ResponseEntity.noContent().build()
    }
}

