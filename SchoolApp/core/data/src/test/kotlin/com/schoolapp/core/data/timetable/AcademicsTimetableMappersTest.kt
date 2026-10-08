package com.schoolapp.core.data.timetable

import com.schoolapp.core.model.timetable.TimetableState
import com.schoolapp.core.network.NetworkJson
import com.schoolapp.core.network.dto.timetable.TeacherSlotDto
import com.schoolapp.core.network.dto.timetable.TimetableDto
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class AcademicsTimetableMappersTest {

    private fun decode(raw: String): TimetableDto = NetworkJson.decodeFromString(raw)

    @Test
    fun new_fields_map_state_numbers_and_friday_schedule() {
        val table = decode(
            """{"sectionId":"s","state":"PUBLISHED_WITH_CHANGES","status":"DRAFT_REVISION","version":3,
               "slots":[{"day":5,"periodIndex":3,"subject":{"name":"Urdu"}}],
               "periods":[{"index":1,"number":1,"startTime":"08:00","endTime":"08:40","isBreak":false,"label":null},
                          {"index":2,"number":null,"startTime":"08:40","endTime":"09:10","isBreak":true,"label":"Break"},
                          {"index":3,"number":2,"startTime":"09:10","endTime":"09:50","isBreak":false,"label":null}],
               "dayPeriods":{"5":[{"index":3,"number":2,"startTime":"08:35","endTime":"09:10"},
                                  {"index":1,"number":1,"startTime":"08:00","endTime":"08:35"}]}}""",
        ).toModel()

        assertEquals(TimetableState.PUBLISHED_WITH_CHANGES, table.state)
        assertEquals(listOf(1, null, 2), table.periods.map { it.number })
        assertEquals("Break", table.periods[1].label)
        assertEquals(listOf("08:00", "08:35"), table.periodsFor(5).map { it.startTime })
        assertEquals(listOf("08:00", "08:40", "09:10"), table.periodsFor(1).map { it.startTime })
    }

    @Test
    fun older_server_draft_v0_without_slots_is_empty_and_numbers_are_counted() {
        val table = decode(
            """{"sectionId":"s","status":"DRAFT","version":0,"slots":[],
               "periods":[{"index":2,"startTime":"08:40","endTime":"09:20","label":"urdu"},
                          {"index":1,"startTime":"08:00","endTime":"08:40","label":"english"},
                          {"index":3,"startTime":"09:20","endTime":"09:40","isBreak":true,"label":"Lunch"},
                          {"index":4,"startTime":"09:40","endTime":"10:20"}]}""",
        ).toModel()

        assertEquals(TimetableState.EMPTY, table.state)
        assertEquals(listOf(1, 2, null, 3), table.periods.map { it.number })
        // Teaching-period labels are never shown (they were often subject names).
        assertEquals(listOf(null, null, "Lunch", null), table.periods.map { it.label })
        assertEquals(table.periods, table.periodsFor(5))
    }

    @Test
    fun legacy_status_maps_to_state() {
        assertEquals(TimetableState.PUBLISHED, decode("""{"sectionId":"s","status":"PUBLISHED"}""").toModel().state)
        assertEquals(TimetableState.PUBLISHED_WITH_CHANGES, decode("""{"sectionId":"s","status":"DRAFT_REVISION"}""").toModel().state)
        assertEquals(
            TimetableState.DRAFT,
            decode("""{"sectionId":"s","status":"DRAFT","slots":[{"day":1,"periodIndex":1}]}""").toModel().state,
        )
        assertEquals(TimetableState.EMPTY, decode("""{"sectionId":"s","status":null,"state":"BOGUS"}""").toModel().state)
    }

    @Test
    fun teacher_slot_period_number_is_optional() {
        val withNumber = NetworkJson.decodeFromString<TeacherSlotDto>("""{"day":5,"periodIndex":6,"periodNumber":5}""").toModel()
        val without = NetworkJson.decodeFromString<TeacherSlotDto>("""{"day":1,"periodIndex":1}""").toModel()
        assertEquals(5, withNumber.periodNumber)
        assertNull(without.periodNumber)
    }
}
