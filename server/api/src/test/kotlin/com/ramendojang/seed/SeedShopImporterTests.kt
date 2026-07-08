package com.ramendojang.seed

import org.junit.jupiter.api.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class SeedShopImporterTests {
    @Test
    fun readsSeedShopJson() {
        val seedStream = requireNotNull(
            Thread.currentThread().contextClassLoader.getResourceAsStream("seed/shops.seed.json"),
        )

        val shops = readSeedShops(seedStream)

        assertFalse(shops.isEmpty())
        assertTrue(shops.all { it.name.isNotBlank() })
        assertTrue(shops.all { it.address.isNotBlank() })
        assertTrue(shops.all { it.tags.isNotEmpty() })
        assertEquals(shops.distinctBy { it.name to it.address }.size, shops.size)
    }
}
