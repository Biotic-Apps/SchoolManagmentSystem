package com.schoolapp.core.data

import com.schoolapp.core.data.attendance.toModel
import com.schoolapp.core.data.complaints.toModel
import com.schoolapp.core.data.diary.toDiaryOutcome
import com.schoolapp.core.data.messages.toModel
import com.schoolapp.core.data.notices.ordered
import com.schoolapp.core.data.notices.toModel
import com.schoolapp.core.data.pickup.pickers
import com.schoolapp.core.model.attendance.AttendanceStatus
import com.schoolapp.core.model.attendance.RegisterStatus
import com.schoolapp.core.model.complaint.ComplaintCategory
import com.schoolapp.core.model.complaint.ComplaintStatus
import com.schoolapp.core.model.diary.DiaryOutcome
import com.schoolapp.core.model.pickup.PickupPerson
import com.schoolapp.core.model.pickup.PickupPersonStatus
import com.schoolapp.core.network.NetworkJson
import com.schoolapp.core.network.dto.attendance.RegisterDto
import com.schoolapp.core.network.dto.complaint.ComplaintDto
import com.schoolapp.core.network.dto.message.ThreadDetailDto
import com.schoolapp.core.network.dto.notice.NoticeDto
import com.schoolapp.core.network.dto.people.GuardianDto
import com.schoolapp.core.network.dto.people.GuardianLinkDto
import kotlinx.serialization.json.jsonObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class Phase3MappersTest {

    @Test
    fun register_keeps_unmarked_entries_null_and_on_leave_flag() {
        val dto = NetworkJson.decodeFromString(
            RegisterDto.serializer(),
            """{"id":null,"sectionId":"sec","date":"2026-10-06","status":"UNMARKED","version":0,"submittedBy":null,
               "entries":[{"entryId":null,"studentId":"s1","name":"Ali","rollNo":1,"status":null,"onLeave":false},
                          {"entryId":"e2","studentId":"s2","name":"Sara","rollNo":2,"status":"LEAVE","remark":"Fever","onLeave":true},
                          {"studentId":"s3","name":"Omar","status":"SOMETHING_NEW"}]}""",
        )
        val register = dto.toModel()
        assertEquals(RegisterStatus.UNMARKED, register.status)
        assertNull(register.id)
        assertEquals(listOf(null, AttendanceStatus.LEAVE, null), register.entries.map { it.status })
        assertEquals(listOf(false, true, false), register.entries.map { it.onLeave })
        assertEquals("Fever", register.entries[1].remark)
    }

    @Test
    fun unknown_register_status_falls_back_to_unmarked() {
        val dto = NetworkJson.decodeFromString(RegisterDto.serializer(), """{"sectionId":"s","date":"d","status":"ARCHIVED"}""")
        assertEquals(RegisterStatus.UNMARKED, dto.toModel().status)
    }

    @Test
    fun anonymous_complaint_has_no_complainant() {
        val json = """{"id":"c1","ticketNo":"CMP-2026-1","category":"FACILITY","subject":"Fan","description":"Broken","status":"IN_PROGRESS",
            "anonymous":true,"complainant":{"id":"u1","name":"Hidden","role":"PARENT"},
            "updates":[{"id":"u2","author":null,"message":"Looking","status":"IN_PROGRESS","at":"2026-10-06T10:00:00Z"}]}"""
        val complaint = NetworkJson.decodeFromString(ComplaintDto.serializer(), json).toModel()
        assertNull(complaint.complainant)
        assertNull(complaint.complainantRole)
        assertEquals(ComplaintCategory.FACILITY, complaint.category)
        assertEquals(ComplaintStatus.IN_PROGRESS, complaint.updates.single().status)
        assertNull(complaint.updates.single().authorName)
    }

    @Test
    fun named_complaint_keeps_complainant_and_unknown_category_is_other() {
        val json = """{"id":"c2","category":"NEW_KIND","status":"SUBMITTED","complainant":{"id":"u1","name":"Ayesha","role":"PARENT"}}"""
        val complaint = NetworkJson.decodeFromString(ComplaintDto.serializer(), json).toModel()
        assertEquals("Ayesha", complaint.complainant?.name)
        assertEquals(ComplaintCategory.OTHER, complaint.category)
    }

    @Test
    fun diary_review_hold_and_moderation_map_to_pending_review() {
        val hold = NetworkJson.parseToJsonElement("""{"status":"PENDING_REVIEW","approvalId":"ap1"}""").jsonObject
        assertEquals(DiaryOutcome.PendingReview("ap1"), hold.toDiaryOutcome(NetworkJson))
        val moderated = NetworkJson.parseToJsonElement("""{"id":"d1","sectionId":"s","date":"2026-10-06","status":"SUBMITTED","approvalId":"ap2"}""").jsonObject
        assertEquals(DiaryOutcome.PendingReview("ap2"), moderated.toDiaryOutcome(NetworkJson))
        val published = NetworkJson.parseToJsonElement(
            """{"id":"d1","sectionId":"s","date":"2026-10-06","status":"PUBLISHED","subject":{"id":"m","name":"Maths"},"topics":"Fractions"}""",
        ).jsonObject
        val saved = published.toDiaryOutcome(NetworkJson) as DiaryOutcome.Saved
        assertEquals("Maths", saved.entry.subjectName)
        assertEquals("m", saved.entry.subjectId)
    }

    @Test
    fun notices_are_pinned_first_then_newest() {
        val notices = listOf(
            NoticeDto(id = "old", title = "Old", publishedAt = "2026-10-01T08:00:00Z"),
            NoticeDto(id = "new", title = "New", publishedAt = "2026-10-05T08:00:00Z", readAt = "2026-10-05T09:00:00Z"),
            NoticeDto(id = "pin", title = "Pinned", pinned = true, publishedAt = "2026-09-01T08:00:00Z"),
        ).map { it.toModel() }.ordered()
        assertEquals(listOf("pin", "new", "old"), notices.map { it.id })
        assertTrue(notices[1].isRead)
        assertFalse(notices[2].isRead)
    }

    @Test
    fun thread_messages_are_oldest_first() {
        val json = """{"thread":{"id":"t1","subject":"Homework","student":{"id":"s1","name":"Ayesha","className":"Class 5","sectionName":"A"},
            "participants":[{"userId":"u1","name":"Mr Khan","role":"TEACHER"}],"unreadCount":2},
            "messages":[{"id":"m2","sender":{"userId":"u1","name":"Mr Khan"},"body":"Second","sentAt":"2026-10-06T09:00:00Z"},
                        {"id":"m1","sender":{"userId":"u2","name":"Parent"},"body":"First","sentAt":"2026-10-06T08:00:00Z","readByOthers":true}]}"""
        val detail = NetworkJson.decodeFromString(ThreadDetailDto.serializer(), json).toModel("cursor-1")
        assertEquals(listOf("m1", "m2"), detail.messages.map { it.id })
        assertEquals("t1", detail.messages.first().threadId)
        assertEquals("cursor-1", detail.olderCursor)
        assertEquals("Ayesha", detail.thread.studentName)
        assertEquals(2, detail.thread.unreadCount)
    }

    @Test
    fun pickers_list_verified_first_and_skip_inactive_guardian_links() {
        val guardians = listOf(
            GuardianLinkDto("l1", GuardianDto("g1", "Father"), relation = "FATHER", status = "VERIFIED"),
            GuardianLinkDto("l2", GuardianDto("g2", "Revoked"), relation = "MOTHER", status = "REVOKED"),
        )
        val persons = listOf(
            PickupPerson("p1", "Driver", "DRIVER", null, "0300", null, PickupPersonStatus.PENDING_VERIFICATION),
            PickupPerson("p2", "Uncle", "UNCLE", null, "0301", null, PickupPersonStatus.VERIFIED),
        )
        val result = pickers(guardians, persons)
        assertEquals(listOf("g1", "p2", "p1"), result.map { it.id })
        assertEquals(listOf(true, true, false), result.map { it.verified })
        assertTrue(result.first().isGuardian)
    }
}
