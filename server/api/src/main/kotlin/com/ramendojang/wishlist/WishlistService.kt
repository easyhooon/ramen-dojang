package com.ramendojang.wishlist

import com.ramendojang.common.ApiException
import com.ramendojang.shop.ShopService
import com.ramendojang.wishlist.dto.CreateWishlistRequest
import com.ramendojang.wishlist.dto.WishlistResponse
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class WishlistService(
    private val wishlistRepository: WishlistRepository,
    private val shopService: ShopService,
) {
    fun upsert(request: CreateWishlistRequest): WishlistResponse {
        shopService.ensureExists(request.shopId)
        return wishlistRepository.upsert(request)
    }

    fun list(): List<WishlistResponse> = wishlistRepository.list()

    fun delete(shopId: UUID) {
        if (!wishlistRepository.delete(shopId)) {
            throw ApiException("WISHLIST_NOT_FOUND", "Wishlist item was not found.", HttpStatus.NOT_FOUND)
        }
    }
}

