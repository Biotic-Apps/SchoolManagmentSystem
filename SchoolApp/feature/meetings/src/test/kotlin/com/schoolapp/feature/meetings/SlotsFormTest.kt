package com.schoolapp.feature.meetings

import com.schoolapp.core.model.meeting.MeetingMode
import com.schoolapp.core.model.meeting.SlotInput
import com.schoolapp.feature.meetings.domain.SlotTimes
import com.schoolapp.feature.meetings.domain.SlotsForm
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Test
import java.time.LocalDate

class SlotsFormTest {

    @Test
    fun starts_with_one_web_default_row() {
        val draft = SlotsForm.start("2026-10-08").drafts.single()
        assertEquals(listOf("2026-10-08", "13:00", "13:15"), listOf(draft.date, draft.startTime, draft.endTime))
        assertEquals(MeetingMode.IN_PERSON, draft.mode)
    }

    @Test
    fun new_row_copies_last_and_starts_where_it_ended() {
        val form = SlotsForm.start("2026-10-08")
            .update(0) { it.copy(startTime = "09:00", endTime = "09:20", mode = MeetingMode.PHONE, location = "Room 4") }
            .addRow()
        val added = form.drafts.last()
        assertEquals(listOf("09:20", "09:40"), listOf(added.startTime, added.endTime))
        assertEquals(MeetingMode.PHONE, added.mode)
        assertEquals("Room 4", added.location)
        assertEquals(listOf(0, 1), form.drafts.map { it.key })
    }

    @Test
    fun new_row_is_at_least_15_minutes_and_never_past_midnight() {
        val short = SlotsForm.start("2026-10-08").update(0) { it.copy(startTime = "10:00", endTime = "09:00") }.addRow()
        assertEquals("09:15", short.drafts.last().endTime)
        val late = SlotsForm.start("2026-10-08").update(0) { it.copy(startTime = "23:30", endTime = "23:50") }.addRow()
        assertEquals("23:55", late.drafts.last().endTime)
    }

    @Test
    fun last_row_cannot_be_removed_and_keys_stay_unique() {
        val form = SlotsForm.start("2026-10-08")
        assertEquals(1, form.removeRow(0).drafts.size)
        val grown = form.addRow().addRow().removeRow(1).addRow()
        assertEquals(listOf(0, 2, 3), grown.drafts.map { it.key })
    }

    @Test
    fun rows_are_capped_at_the_api_limit() {
        var form = SlotsForm.start("2026-10-08")
        repeat(60) { form = form.addRow() }
        assertEquals(SlotsForm.MAX_SLOTS, form.drafts.size)
        assertFalse(form.canAddRow)
    }

    @Test
    fun inputs_trim_location_and_drop_blank() {
        val form = SlotsForm.start("2026-10-08").update(0) { it.copy(location = "  ") }.addRow().update(1) { it.copy(location = " Staff room ") }
        assertEquals(
            listOf(
                SlotInput("2026-10-08", "13:00", "13:15", MeetingMode.IN_PERSON, null),
                SlotInput("2026-10-08", "13:15", "13:30", MeetingMode.IN_PERSON, "Staff room"),
            ),
            form.toInputs(),
        )
    }

    @Test
    fun week_starts_on_monday() {
        assertEquals(LocalDate.of(2026, 10, 5), SlotTimes.weekStart(LocalDate.of(2026, 10, 7)))
        assertEquals(LocalDate.of(2026, 10, 5), SlotTimes.weekStart(LocalDate.of(2026, 10, 5)))
        assertEquals(LocalDate.of(2026, 10, 5), SlotTimes.weekStart(LocalDate.of(2026, 10, 11)))
    }
}
