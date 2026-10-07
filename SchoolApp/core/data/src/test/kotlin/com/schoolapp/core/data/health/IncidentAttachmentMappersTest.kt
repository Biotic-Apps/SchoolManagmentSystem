package com.schoolapp.core.data.health

import com.schoolapp.core.model.health.IncidentInput
import com.schoolapp.core.model.health.IncidentSeverity
import com.schoolapp.core.model.health.IncidentType
import com.schoolapp.core.network.NetworkJson
import com.schoolapp.core.network.dto.health.IncidentDto
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class IncidentAttachmentMappersTest {

    private val input = IncidentInput("s1", "2026-10-06T05:00:00Z", IncidentType.INJURY, IncidentSeverity.MINOR, " Fell ", " Ice ")

    @Test
    fun incident_body_carries_attachment_ids_only_when_present() {
        assertNull(input.toBody().attachmentFileIds)
        assertEquals(listOf("f1"), input.copy(attachmentFileIds = listOf("f1")).toBody().attachmentFileIds)
    }

    @Test
    fun incident_attachments_are_mapped_and_unknown_ids_dropped() {
        val dto = NetworkJson.decodeFromString(
            IncidentDto.serializer(),
            """{"id":"i1","student":{"id":"s1","name":"Ali"},"occurredAt":"2026-10-06T05:00:00Z","type":"INJURY","severity":"MINOR",
               "description":"Fell","actionTaken":"Ice","status":"OPEN","reportedBy":{"id":"u1","name":"Sara"},
               "attachments":[{"id":"f1","url":"https://x/f1","mime":"application/pdf","name":"note.pdf"},{"url":"https://x/none"}]}""",
        )
        val incident = dto.toModel()
        assertEquals(listOf("f1"), incident.attachments.map { it.id })
        assertEquals("note.pdf", incident.attachments.single().name)
    }

    @Test
    fun incident_without_attachments_maps_to_empty_list() {
        val dto = NetworkJson.decodeFromString(IncidentDto.serializer(), """{"id":"i2","occurredAt":"2026-10-06T05:00:00Z"}""")
        assertTrue(dto.toModel().attachments.isEmpty())
    }
}
