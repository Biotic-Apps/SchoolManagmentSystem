package com.schoolapp.core.data

import com.schoolapp.core.data.admissions.toModel
import com.schoolapp.core.data.approvals.toApprovalDetails
import com.schoolapp.core.data.auth.toSessionContext
import com.schoolapp.core.data.people.toModel
import com.schoolapp.core.data.timetable.toModel
import com.schoolapp.core.model.admissions.ApplicationStatus
import com.schoolapp.core.network.NetworkJson
import com.schoolapp.core.network.dto.admissions.ApplicationDto
import com.schoolapp.core.network.dto.me.MeDto
import com.schoolapp.core.network.dto.people.StudentDetailDto
import com.schoolapp.core.network.dto.timetable.TeacherSlotDto
import com.schoolapp.core.network.dto.timetable.TimetableDto
import kotlinx.serialization.json.JsonObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class Phase2MappersTest {

    private inline fun <reified T> decode(raw: String): T = NetworkJson.decodeFromString(raw)

    @Test
    fun me_children_carry_admission_no_photo_and_session() {
        val me = decode<MeDto>(
            """{"user":{"id":"u1","name":"Imran"},"activeRole":"PARENT","roles":["PARENT"],
               "children":[{"id":"c1","name":"Ayesha Khan","admissionNo":"BS-2026-0010","photoUrl":"https://x/p.jpg",
               "className":"Class 5","sectionName":"A","branchName":"Main","sessionName":"2026-27"}]}""",
        )
        val child = me.toSessionContext(null)!!.children.single()
        assertEquals("BS-2026-0010", child.admissionNo)
        assertEquals("https://x/p.jpg", child.photoUrl)
        assertEquals("2026-27", child.sessionName)
    }

    @Test
    fun student_detail_maps_guardians_primary_first_and_documents() {
        val detail = decode<StudentDetailDto>(
            """{"id":"s1","name":"Ayesha Khan","admissionNo":"BS-1","rollNo":3,"sectionId":"sec1","status":"ACTIVE",
               "primaryGuardian":{"name":"Imran","phone":"0300"},
               "enrollment":{"id":"e1","sessionName":"2026-27","className":"Class 5","sectionName":"A","status":"ACTIVE"},
               "guardians":[
                 {"id":"l2","isPrimary":false,"status":"VERIFIED","guardian":{"id":"g2","name":"Sadia","relation":"MOTHER"}},
                 {"id":"l1","isPrimary":true,"relation":"FATHER","status":"VERIFIED","guardian":{"id":"g1","name":"Imran","phone":"0300","hasAccount":true}}],
               "documents":[{"id":"d1","docType":"B_FORM","status":"VERIFIED","file":{"id":"f1","url":"https://x/d.pdf","mime":"application/pdf"}}]}""",
        ).toModel()
        assertEquals(listOf("Imran", "Sadia"), detail.guardians.map { it.guardian.name })
        assertEquals("MOTHER", detail.guardians[1].relation)
        assertEquals("https://x/d.pdf", detail.documents.single().fileUrl)
        assertEquals("sec1", detail.summary.sectionId)
        assertEquals("2026-27", detail.enrollment?.sessionName)
    }

    @Test
    fun teacher_slot_and_timetable_map_nested_refs() {
        val slot = decode<TeacherSlotDto>(
            """{"date":"2026-10-05","day":1,"periodIndex":2,"startTime":"08:40","endTime":"09:20",
               "section":{"id":"s","name":"A","className":"Class 5"},"subject":{"id":"m","name":"Maths"},"room":{"id":"r","name":"Room 12"},"isSubstitute":true}""",
        ).toModel()
        assertEquals("Class 5", slot.className)
        assertEquals("Room 12", slot.roomName)
        assertTrue(slot.isSubstitute)
        val table = decode<TimetableDto>(
            """{"sectionId":"s","status":"PUBLISHED","slots":[{"day":1,"periodIndex":1,"subject":{"name":"Urdu"},"staff":{"name":"Hina"}}],
               "periods":[{"index":2,"startTime":"08:40","endTime":"09:20"},{"index":1,"startTime":"08:00","endTime":"08:40"}]}""",
        ).toModel()
        assertEquals(listOf(1, 2), table.periods.map { it.index })
        assertEquals("Hina", table.slots.single().staffName)
    }

    @Test
    fun application_joins_child_name_and_status() {
        val app = decode<ApplicationDto>(
            """{"id":"a1","applicationNo":"APP-2026-001","status":"WAITLISTED","waitlistPosition":2,
               "child":{"firstName":"Noor","lastName":"Fatima"},"guardians":[{"name":"X","isPrimary":false},{"name":"Y","isPrimary":true}],
               "documents":[{"id":"d1"},{"id":"d2"}]}""",
        ).toModel()
        assertEquals("Noor Fatima", app.childName)
        assertEquals(ApplicationStatus.WAITLISTED, app.status)
        assertEquals("Y", app.guardians.first().name)
        assertEquals(2, app.documentCount)
        assertFalse(app.status.isDecidable)
    }

    @Test
    fun approval_payload_is_flattened_without_ids_and_with_12_hour_times() {
        val details = decode<JsonObject>(
            """{"studentId":"s1","student":{"id":"s1","name":"Maryam"},"relation":"GUARDIAN","chapters":[{},{}],"lockTime":"14:30","note":null}""",
        ).toApprovalDetails()
        assertEquals(
            listOf("student.name" to "Maryam", "relation" to "GUARDIAN", "chapters" to "2", "lockTime" to "2:30 PM"),
            details,
        )
    }
}
