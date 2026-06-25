package com.ramendojang

import org.junit.jupiter.api.Test
import kotlin.test.assertEquals

class ApiApplicationTests {

	@Test
	fun healthReturnsOk() {
		assertEquals(mapOf("status" to "ok"), HealthController().health())
	}

}
