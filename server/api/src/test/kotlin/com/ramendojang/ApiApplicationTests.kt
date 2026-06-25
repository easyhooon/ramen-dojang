package com.ramendojang

import org.junit.jupiter.api.Test
import kotlin.test.assertEquals

class ApiApplicationTests {

	@Test
	fun healthReturnsOk() {
		assertEquals(HealthResponse(status = "ok"), HealthController().health())
	}

}
