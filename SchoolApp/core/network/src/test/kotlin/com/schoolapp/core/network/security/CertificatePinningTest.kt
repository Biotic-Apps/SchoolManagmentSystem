package com.schoolapp.core.network.security

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Test

class CertificatePinningTest {

    private val pinA = "sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="
    private val pinB = "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBA="

    @Test
    fun `empty config disables pinning`() {
        assertNull(CertificatePinning.pinnerOrNull("", ""))
        assertNull(CertificatePinning.pinnerOrNull("  ", "$pinA,$pinB"))
        assertNull(CertificatePinning.pinnerOrNull("api.school.pk", ""))
    }

    @Test
    fun `a single pin is rejected so there is always a backup pin`() {
        assertNull(CertificatePinning.pinnerOrNull("api.school.pk", pinA))
        assertNull(CertificatePinning.pinnerOrNull("api.school.pk", "$pinA, $pinA"))
    }

    @Test
    fun `malformed pins are ignored`() {
        assertNull(CertificatePinning.pinnerOrNull("api.school.pk", "$pinA,sha256/short=,not-a-pin"))
    }

    @Test
    fun `two valid pins build a pinner for the host`() {
        val pinner = CertificatePinning.pinnerOrNull(" api.school.pk ", " $pinA , $pinB ")
        assertNotNull(pinner)
        val pins = pinner!!.pins
        assertEquals(2, pins.size)
        assertEquals(setOf("api.school.pk"), pins.map { it.pattern }.toSet())
        assertEquals(setOf(pinA, "sha256/$pinB"), pins.map { it.toString() }.toSet())
    }

    @Test
    fun `pins accept values with or without the sha256 prefix`() {
        assertEquals(listOf(pinA, "sha256/$pinB"), CertificatePinning.parsePins("$pinA,$pinB"))
    }
}
