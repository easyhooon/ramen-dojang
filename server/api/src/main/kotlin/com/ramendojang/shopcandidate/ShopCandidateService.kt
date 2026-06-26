package com.ramendojang.shopcandidate

import org.springframework.stereotype.Service

@Service
class ShopCandidateService(
    private val naverLocalSearchClient: NaverLocalSearchClient,
    private val shopCandidateRepository: ShopCandidateRepository,
) {
    fun syncFromNaver(request: SyncShopCandidatesRequest): SyncShopCandidatesResponse {
        val candidates = naverLocalSearchClient.search(
            query = request.query.trim(),
            display = request.display,
        )
            .map(NaverLocalCandidateMapper::toCandidate)
            .map(shopCandidateRepository::upsert)

        return SyncShopCandidatesResponse(count = candidates.size, candidates = candidates)
    }
}
