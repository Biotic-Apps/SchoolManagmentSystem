package com.schoolapp.feature.meetings

import com.schoolapp.feature.meetings.domain.SlotDraft
import com.schoolapp.feature.meetings.domain.SlotProblem
import com.schoolapp.feature.meetings.domain.SlotValidator
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import java.time.LocalDateTime

class SlotValidatorTest {

    private val now = LocalDateTime.of(2026, 10, 7, 10, 30)

    private fun draft(key: Int = 0, date: String = "2026-10-08", start: String = "13:00", end: String = "13:15", location: String = "") =
        SlotDraft(key, date, start, end, location = location)

    @Test
    fun future_slot_is_valid() {
        assertTrue(SlotValidator.validate(listOf(draft()), now).isEmpty())
    }

    @Test
    fun past_date_is_rejected() {
        assertEquals(mapOf(0 to setOf(SlotProblem.DATE_PAST)), SlotValidator.validate(listOf(draft(date = "2026-10-06")), now))
    }

    @Test
    fun today_needs_a_start_after_now() {
        assertEquals(setOf(SlotProblem.START_PAST), SlotValidator.validate(listOf(draft(date = "2026-10-07", start = "10:30", end = "10:45")), now)[0])
        assertTrue(SlotValidator.validate(listOf(draft(date = "2026-10-07", start = "10:31", end = "10:45")), now).isEmpty())
    }

    @Test
    fun end_must_be_after_start() {
        assertEquals(setOf(SlotProblem.END_BEFORE_START), SlotValidator.validate(listOf(draft(start = "13:00", end = "13:00")), now)[0])
        assertEquals(setOf(SlotProblem.END_BEFORE_START), SlotValidator.validate(listOf(draft(start = "14:00", end = "09:00")), now)[0])
    }

    @Test
    fun overlapping_rows_flag_the_later_row_only() {
        val result = SlotValidator.validate(listOf(draft(0, start = "13:00", end = "13:30"), draft(1, start = "13:15", end = "13:45")), now)
        assertEquals(mapOf(1 to setOf(SlotProblem.OVERLAP)), result)
    }

    @Test
    fun back_to_back_and_other_day_rows_do_not_overlap() {
        val drafts = listOf(
            draft(0, start = "13:00", end = "13:15"),
            draft(1, start = "13:15", end = "13:30"),
            draft(2, date = "2026-10-09", start = "13:00", end = "13:15"),
        )
        assertTrue(SlotValidator.validate(drafts, now).isEmpty())
    }

    @Test
    fun long_location_is_rejected() {
        val result = SlotValidator.validate(listOf(draft(location = "x".repeat(SlotValidator.MAX_LOCATION + 1))), now)
        assertEquals(setOf(SlotProblem.LOCATION_TOO_LONG), result[0])
    }
}
