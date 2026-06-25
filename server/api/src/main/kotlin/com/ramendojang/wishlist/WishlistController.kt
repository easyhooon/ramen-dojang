package com.ramendojang.wishlist

import com.ramendojang.wishlist.dto.CreateWishlistRequest
import com.ramendojang.wishlist.dto.WishlistResponse
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
class WishlistController(
    private val wishlistService: WishlistService,
) {
    @PostMapping
    fun upsert(@Valid @RequestBody request: CreateWishlistRequest): ResponseEntity<WishlistResponse> {
        val item = wishlistService.upsert(request)
        return ResponseEntity.created(URI.create("/wishlist/${item.shopId}")).body(item)
    }

    @GetMapping
    fun list(): List<WishlistResponse> = wishlistService.list()

    @DeleteMapping("/{shopId}")
    fun delete(@PathVariable shopId: UUID): ResponseEntity<Void> {
        wishlistService.delete(shopId)
        return ResponseEntity.noContent().build()
    }
}

