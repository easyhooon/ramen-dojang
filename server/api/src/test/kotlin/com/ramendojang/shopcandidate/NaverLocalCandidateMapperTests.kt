package com.ramendojang.shopcandidate

import org.junit.jupiter.api.Test
import kotlin.test.assertEquals

class NaverLocalCandidateMapperTests {
    @Test
    fun mapsNaverItemToCandidate() {
        val candidate = NaverLocalCandidateMapper.toCandidate(
            NaverLocalItem(
                title = "<b>멘야</b>라멘",
                link = "https://example.com/place",
                category = "일식>일본식라면",
                address = "서울 강남구 역삼동",
                roadAddress = "서울 강남구 테헤란로",
                mapx = "1270123456",
                mapy = "375123456",
            ),
        )

        assertEquals("멘야라멘", candidate.normalizedName)
        assertEquals("서울 강남구 테헤란로", candidate.address)
        assertEquals(127.0123456, candidate.longitude)
        assertEquals(37.5123456, candidate.latitude)
        assertEquals("https://example.com/place", candidate.sourcePlaceId)
    }

    @Test
    fun leavesLegacyCoordinateEmpty() {
        assertEquals(null, NaverLocalCandidateMapper.coordinate("311277"))
    }
}
