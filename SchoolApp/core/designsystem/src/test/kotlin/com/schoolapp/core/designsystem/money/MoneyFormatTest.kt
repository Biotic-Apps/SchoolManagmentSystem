package com.schoolapp.core.designsystem.money

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class MoneyFormatTest {

    @Test
    fun `formats minor units as rupees with grouping`() {
        assertEquals("Rs 12,500", MoneyFormat.format(1_250_000))
        assertEquals("Rs 0", MoneyFormat.format(0))
        assertEquals("Rs 1,250,000", MoneyFormat.format(125_000_000))
    }

    @Test
    fun `shows paisa only when present`() {
        assertEquals("Rs 12,500.50", MoneyFormat.format(1_250_050))
        assertEquals("Rs 0.05", MoneyFormat.format(5))
    }

    @Test
    fun `negative amounts put the sign before the symbol`() {
        assertEquals("-Rs 500", MoneyFormat.format(-50_000))
    }

    @Test
    fun `other currencies use their code`() {
        assertEquals("USD 10", MoneyFormat.format(1_000, "USD"))
        assertEquals("Rs 10", MoneyFormat.format(1_000, "pkr"))
    }

    @Test
    fun `parses typed amounts into minor units`() {
        assertEquals(1_250_000L, MoneyFormat.parse("12,500"))
        assertEquals(1_250_050L, MoneyFormat.parse("12500.5"))
        assertEquals(1_250_055L, MoneyFormat.parse(" 12500.55 "))
        assertEquals(0L, MoneyFormat.parse("0"))
    }

    @Test
    fun `rejects invalid input`() {
        assertNull(MoneyFormat.parse(""))
        assertNull(MoneyFormat.parse("abc"))
        assertNull(MoneyFormat.parse("-5"))
        assertNull(MoneyFormat.parse("1.234"))
        assertNull(MoneyFormat.parse("1.2.3"))
    }

    @Test
    fun `round trips input text`() {
        assertEquals("12500", MoneyFormat.toInput(1_250_000))
        assertEquals("12500.50", MoneyFormat.toInput(1_250_050))
    }
}
