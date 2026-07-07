package com.ramendojang.shopcandidate

import com.ramendojang.common.ApiException
import com.ramendojang.shop.ShopService
import com.ramendojang.shop.dto.CreateShopRequest
import com.ramendojang.shop.dto.ShopResponse
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class ShopCandidateService(
    private val naverLocalSearchClient: NaverLocalSearchClient,
    private val shopCandidateRepository: ShopCandidateRepository,
    private val shopService: ShopService,
) {
    fun list(status: String?): List<ShopCandidateResponse> {
        if (status != null && status !in setOf("pending", "rejected", "promoted")) {
            throw ApiException("INVALID_SHOP_CANDIDATE_STATUS", "Shop candidate status is invalid.", HttpStatus.BAD_REQUEST)
        }

        return shopCandidateRepository.list(status)
    }

    fun syncFromNaver(request: SyncShopCandidatesRequest): SyncShopCandidatesResponse {
        val candidates = naverLocalSearchClient.search(
            query = request.query.trim(),
            display = request.display,
        )
            .map(NaverLocalCandidateMapper::toCandidate)
            .map(shopCandidateRepository::upsert)

        return SyncShopCandidatesResponse(count = candidates.size, candidates = candidates)
    }

    fun promote(candidateId: UUID): ShopResponse {
        val candidate = shopCandidateRepository.findById(candidateId) ?: throw notFound()

        candidate.promotedShopId?.let { return shopService.get(it) }

        val latitude = candidate.latitude ?: throw missingLocation()
        val longitude = candidate.longitude ?: throw missingLocation()
        val shop = shopService.create(
            CreateShopRequest(
                name = candidate.normalizedName,
                address = candidate.address,
                latitude = latitude,
                longitude = longitude,
                placeUrl = candidate.sourcePlaceId?.takeIf { it.startsWith("http") },
                tagNames = candidate.tags(),
            ),
        )
        shopCandidateRepository.markPromoted(candidate.id, shop.id)
        return shop
    }

    private fun ShopCandidateResponse.tags(): List<String> =
        listOfNotNull("라멘", category?.substringAfterLast(">")?.trim()?.takeIf(String::isNotBlank)).distinct()

    private fun notFound(): ApiException =
        ApiException("SHOP_CANDIDATE_NOT_FOUND", "Shop candidate was not found.", HttpStatus.NOT_FOUND)

    private fun missingLocation(): ApiException =
        ApiException("SHOP_CANDIDATE_LOCATION_REQUIRED", "Shop candidate latitude and longitude are required.", HttpStatus.BAD_REQUEST)
}
