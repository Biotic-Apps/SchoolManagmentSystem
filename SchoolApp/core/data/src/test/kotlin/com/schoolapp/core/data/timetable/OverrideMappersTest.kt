package com.schoolapp.core.data.timetable

import com.schoolapp.core.model.timetable.OverrideInput
import com.schoolapp.core.network.NetworkJson
import com.schoolapp.core.network.dto.timetable.TimetableOverrideDto
import com.schoolapp.core.network.model.ApiEnvelope
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class OverrideMappersTest {

    private fun decode(raw: String): List<TimetableOverrideDto> =
        NetworkJson.decodeFromString<ApiEnvelope<List<TimetableOverrideDto>>>(raw).data

    @Test
    fun live_empty_day_decodes_to_no_overrides() {
        // Captured from GET /timetable-overrides?branchId=…&date=2026-10-08 (principal).
        assertTrue(decode("""{"data":[]}""").isEmpty())
    }

    @Test
    fun override_maps_people_reason_and_date() {
        // Shape of OverridesService.toDto, with ids of the live demo branch (section "Class 1 A", Demo Teacher).
        val raw = """{"data":[{"id":"01a20000-0000-7000-8000-000000000001",
            "sectionId":"01a1100a-a019-701d-b358-af58b5126506","date":"2026-10-08","periodIndex":3,
            "originalStaff":{"id":"01a1100a-a867-70d2-881a-86482d2f76d8","name":"Demo Coordinator"},
            "substituteStaff":{"id":"01a1100a-a84e-7019-9d9e-f7c614673b7f","name":"Demo Teacher"},
            "reason":"Class teacher on leave","createdAt":"2026-10-08T07:12:44.120Z"}]}"""
        val override = decode(raw).single().toModel()

        assertEquals("01a1100a-a019-701d-b358-af58b5126506", override.sectionId)
        assertEquals("2026-10-08", override.date)
        assertEquals(3, override.periodIndex)
        assertEquals("Demo Teacher", override.substituteName)
        assertEquals("01a1100a-a84e-7019-9d9e-f7c614673b7f", override.substituteStaffId)
        assertEquals("Demo Coordinator", override.originalTeacherName)
        assertEquals("Class teacher on leave", override.reason)
        assertNull(override.className)
    }

    @Test
    fun slot_without_teacher_and_optional_section_names() {
        val raw = """{"data":[{"id":"o2","sectionId":"s1","date":"2026-10-09T00:00:00.000Z","periodIndex":1,
            "originalStaff":null,"substituteStaff":null,"substituteStaffId":"t9","reason":"",
            "className":"Class 5","sectionName":"B"}]}"""
        val override = decode(raw).single().toModel()

        assertEquals("2026-10-09", override.date)
        assertNull(override.originalTeacherName)
        assertNull(override.substituteName)
        assertEquals("t9", override.substituteStaffId)
        assertNull(override.reason)
        assertEquals("Class 5", override.className)
        assertEquals("B", override.sectionName)
    }

    @Test
    fun input_trims_reason_for_the_request() {
        val request = OverrideInput("s1", "2026-10-08", 2, "t1", "  Sick leave  ").toRequest()
        assertEquals("Sick leave", request.reason)
        assertEquals(2, request.periodIndex)
        val json = NetworkJson.encodeToString(com.schoolapp.core.network.dto.timetable.CreateOverrideRequest.serializer(), request)
        assertEquals(
            """{"sectionId":"s1","date":"2026-10-08","periodIndex":2,"substituteStaffId":"t1","reason":"Sick leave"}""",
            json,
        )
    }
}
