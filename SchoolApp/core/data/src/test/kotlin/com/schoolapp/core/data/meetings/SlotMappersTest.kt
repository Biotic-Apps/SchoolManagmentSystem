package com.schoolapp.core.data.meetings

import com.schoolapp.core.model.meeting.MeetingMode
import com.schoolapp.core.model.meeting.SlotInput
import com.schoolapp.core.network.NetworkJson
import com.schoolapp.core.network.dto.meeting.CreateSlotsBodyDto
import com.schoolapp.core.network.dto.meeting.MeetingSlotDto
import kotlinx.serialization.builtins.ListSerializer
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Test

class SlotMappersTest {

    @Test
    fun create_body_sends_mode_name_and_omits_blank_location() {
        val body = listOf(
            SlotInput("2026-10-08", "13:00", "13:15", MeetingMode.VIDEO, "   "),
            SlotInput("2026-10-08", "13:15", "13:30", MeetingMode.IN_PERSON, " Staff room "),
        ).toCreateBody()
        val json = NetworkJson.encodeToString(CreateSlotsBodyDto.serializer(), body)
        assertEquals(
            """{"slots":[{"date":"2026-10-08","startTime":"13:00","endTime":"13:15","mode":"VIDEO"},""" +
                """{"date":"2026-10-08","startTime":"13:15","endTime":"13:30","mode":"IN_PERSON","location":"Staff room"}]}""",
            json,
        )
        assertFalse(json.contains("null"))
    }

    @Test
    fun own_slots_drop_cancelled_and_sort_by_date_then_time() {
        val dtos = NetworkJson.decodeFromString(
            ListSerializer(MeetingSlotDto.serializer()),
            """[{"id":"c","staff":{"userId":"u1","name":"Sara"},"date":"2026-10-09","startTime":"09:00","endTime":"09:15","mode":"PHONE","location":null,"status":"OPEN"},
                {"id":"b","date":"2026-10-08","startTime":"10:00","endTime":"10:15","mode":"IN_PERSON","status":"BOOKED"},
                {"id":"x","date":"2026-10-08","startTime":"08:00","endTime":"08:15","mode":"IN_PERSON","status":"CANCELLED"},
                {"id":"a","date":"2026-10-08","startTime":"09:00","endTime":"09:15","mode":"SOMETHING_NEW","status":"OPEN"}]""",
        )
        val slots = dtos.toOwnSlots()
        assertEquals(listOf("a", "b", "c"), slots.map { it.id })
        assertEquals(MeetingMode.IN_PERSON, slots.first().mode)
        assertEquals(MeetingMode.PHONE, slots.last().mode)
        assertEquals("BOOKED", slots[1].status)
    }
}
