package com.schoolapp.core.common.time

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test
import java.time.Instant
import java.time.LocalDate
import java.time.LocalTime
import java.time.ZoneId

class TimeFormatTest {

    @Test
    fun formats_api_times_as_12_hour_with_am_pm() {
        assertEquals("1:05 PM", TimeFormat.formatTime12("13:05"))
        assertEquals("8:00 AM", TimeFormat.formatTime12("08:00"))
        assertEquals("12:00 AM", TimeFormat.formatTime12("00:00"))
        assertEquals("12:30 PM", TimeFormat.formatTime12("12:30"))
        assertEquals("11:59 PM", TimeFormat.formatTime12("23:59"))
        assertEquals("7:15 AM", TimeFormat.formatTime12("7:15"))
        assertEquals("4:00 PM", TimeFormat.formatTime12("16:00:00"))
    }

    @Test
    fun leaves_non_times_unchanged() {
        assertEquals("Off", TimeFormat.formatTime12("Off"))
        assertEquals("25:00", TimeFormat.formatTime12("25:00"))
        assertNull(TimeFormat.parseTime("2026-10-05"))
        assertFalse(TimeFormat.isTime24h("abc"))
        assertTrue(TimeFormat.isTime24h("11:00"))
    }

    @Test
    fun formats_instants_in_the_given_zone_with_12_hour_clock() {
        val instant = Instant.parse("2026-10-05T07:10:00Z")
        assertEquals("5 Oct 2026, 12:10 PM", TimeFormat.formatDateTime12(instant, ZoneId.of("Asia/Karachi")))
        assertEquals("5 Oct 2026, 7:10 AM", TimeFormat.formatDateTime12(instant, ZoneId.of("UTC")))
    }

    @Test
    fun round_trips_api_time_and_formats_dates() {
        assertEquals("08:05", TimeFormat.toApiTime(LocalTime.of(8, 5)))
        assertEquals("14 Aug 2026", TimeFormat.formatDate(LocalDate.of(2026, 8, 14)))
    }
}
