package com.ramendojang.shopcandidate

import com.ramendojang.common.ApiException
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Component
import org.springframework.web.client.RestClient

@Component
class NaverLocalSearchClient(
    restClientBuilder: RestClient.Builder,
    @Value("\${naver.search.client-id:}") private val clientId: String,
    @Value("\${naver.search.client-secret:}") private val clientSecret: String,
) {
    private val restClient = restClientBuilder.baseUrl("https://openapi.naver.com").build()

    fun search(query: String, display: Int): List<NaverLocalItem> {
        if (clientId.isBlank() || clientSecret.isBlank()) {
            throw ApiException(
                code = "NAVER_SEARCH_NOT_CONFIGURED",
                message = "Naver Search API credentials are not configured.",
                status = HttpStatus.SERVICE_UNAVAILABLE,
            )
        }

        return restClient.get()
            .uri { builder ->
                builder.path("/v1/search/local.json")
                    .queryParam("query", query)
                    .queryParam("display", display)
                    .build()
            }
            .header("X-Naver-Client-Id", clientId)
            .header("X-Naver-Client-Secret", clientSecret)
            .retrieve()
            .body(NaverLocalSearchResponse::class.java)
            ?.items
            .orEmpty()
    }
}
