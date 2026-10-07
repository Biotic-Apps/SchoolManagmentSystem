package com.schoolapp.demo

import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class DemoOtpTest {

    @Test
    fun demo_parent_phone_matches_common_spellings() {
        listOf("03001234567", "0300 1234567", "+92 300 1234567", "+923001234567", "0092-300-1234567").forEach {
            assertTrue(it, DemoOtp.isDemoPhone(it))
        }
    }

    @Test
    fun other_phones_go_to_the_server() {
        listOf("03001234568", "+44 300 1234567", "", "3001234567").forEach {
            assertFalse(it, DemoOtp.isDemoPhone(it))
        }
    }

    @Test
    fun only_the_fixed_code_signs_in() {
        assertTrue(DemoOtp.accepts("03001234567", "123456"))
        assertTrue(DemoOtp.accepts("+923001234567", " 123456 "))
        assertFalse(DemoOtp.accepts("03001234567", "654321"))
        assertFalse(DemoOtp.accepts("03009999999", "123456"))
    }
}
