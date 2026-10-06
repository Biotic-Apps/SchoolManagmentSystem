package com.schoolapp.feature.notices

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.notices.NoticesRepository
import com.schoolapp.core.data.organisation.OrganisationRepository
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.notice.Notice
import com.schoolapp.core.model.notice.NoticeInput
import com.schoolapp.core.model.notice.NoticeStatus
import com.schoolapp.core.model.organisation.AcademicSession
import com.schoolapp.core.model.organisation.Branch
import com.schoolapp.core.model.organisation.BranchOverview
import com.schoolapp.core.model.organisation.CalendarEvent
import com.schoolapp.core.model.organisation.SchoolClass
import com.schoolapp.core.model.organisation.Section
import com.schoolapp.core.model.organisation.Subject
import com.schoolapp.core.testing.FakeAuthRepository
import com.schoolapp.core.testing.MainDispatcherRule
import com.schoolapp.core.testing.TestSessions
import com.schoolapp.feature.notices.compose.AudienceMode
import com.schoolapp.feature.notices.compose.NoticeComposeViewModel
import com.schoolapp.feature.notices.feed.NoticesFeedViewModel
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import java.time.LocalDateTime

class NoticesViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val principal = FakeAuthRepository(TestSessions.session(RoleKey.PRINCIPAL, "notices.view", "notices.add", "notices.publish"))
    private val clock = AppClock { LocalDateTime.of(2026, 10, 6, 9, 0) }
    private val events = NoticeEvents()

    private fun notice(id: String, pinned: Boolean = false, isRead: Boolean = false) =
        Notice(id, "Title $id", "Body", NoticeStatus.PUBLISHED, pinned, "2026-10-0${id.last()}T08:00:00Z", null, "Principal", "Whole branch", isRead)

    @Test
    fun pinned_notices_come_first_and_server_order_is_kept() {
        val repository = FakeNoticesRepository(listOf(notice("n1"), notice("n2", pinned = true), notice("n3"), notice("n4", pinned = true)))
        val vm = NoticesFeedViewModel(repository, principal, events)
        assertEquals(listOf("n2", "n4", "n1", "n3"), vm.uiState.value.notices.map { it.id })
        assertTrue(vm.uiState.value.canAdd)
        assertEquals("b1", repository.branchIds.single())
    }

    @Test
    fun opening_a_notice_marks_it_read_once() {
        val repository = FakeNoticesRepository(listOf(notice("n1"), notice("n2", isRead = true)))
        val vm = NoticesFeedViewModel(repository, principal, events)
        vm.onOpen("n1")
        assertTrue(vm.uiState.value.notices.first { it.id == "n1" }.isRead)
        assertEquals(listOf("n1"), repository.reads)
        assertEquals(true, events.opened("n1")?.isRead)
        vm.onOpen("n1")
        vm.onOpen("n2")
        assertEquals(listOf("n1"), repository.reads)
    }

    @Test
    fun compose_requires_title_body_and_audience() {
        val repository = FakeNoticesRepository(emptyList())
        val vm = NoticeComposeViewModel(repository, FakeOrganisationRepository(), principal, events, clock)
        vm.publish()
        val state = vm.uiState.value
        assertTrue(state.titleMissing)
        assertTrue(state.bodyMissing)
        assertFalse(state.audienceMissing)

        vm.onTitleChange("Sports day")
        vm.onBodyChange("Friday")
        vm.onAudienceChange(AudienceMode.SECTIONS)
        vm.publish()
        assertTrue(vm.uiState.value.audienceMissing)
        assertTrue(repository.created.isEmpty())

        vm.onToggleSection("s1")
        vm.publish()
        val input = repository.created.single()
        assertEquals(listOf("s1"), input.sectionIds)
        assertFalse(input.wholeBranch)
        assertEquals("b1", input.branchId)
        assertEquals(NoticeComposeResult.PUBLISHED, vm.uiState.value.result)
    }

    @Test
    fun pending_review_result_is_sent_for_approval() {
        val repository = FakeNoticesRepository(emptyList()).apply { createdStatus = NoticeStatus.PENDING_REVIEW }
        val vm = NoticeComposeViewModel(repository, FakeOrganisationRepository(), principal, events, clock)
        vm.onTitleChange("Trip")
        vm.onBodyChange("Museum")
        vm.publish()
        assertTrue(repository.created.single().wholeBranch)
        assertEquals(NoticeComposeResult.SENT_FOR_APPROVAL, vm.uiState.value.result)
        assertEquals(NoticeComposeResult.SENT_FOR_APPROVAL, events.composeResult.value)
        assertEquals(listOf("Class 5 - A"), vm.uiState.value.sections.map { it.label })
        assertNull(vm.uiState.value.optionsError)
    }

    private class FakeNoticesRepository(private val notices: List<Notice>) : NoticesRepository {
        val reads = mutableListOf<String>()
        val created = mutableListOf<NoticeInput>()
        val branchIds = mutableListOf<String?>()
        var createdStatus = NoticeStatus.PUBLISHED

        override suspend fun notices(branchId: String?): AppResult<List<Notice>> {
            branchIds += branchId
            return AppResult.Success(notices)
        }

        override suspend fun createAndPublish(input: NoticeInput): AppResult<Notice> {
            created += input
            return AppResult.Success(Notice("new", input.title, input.body, createdStatus, input.pinned, null, null, null, null, true))
        }

        override suspend fun markRead(id: String): AppResult<Unit> {
            reads += id
            return AppResult.Success(Unit)
        }
    }

    private class FakeOrganisationRepository : OrganisationRepository {
        override suspend fun branches(): AppResult<List<Branch>> = AppResult.Success(emptyList())
        override suspend fun branchOverview(branchId: String): AppResult<BranchOverview> = AppResult.Failure(AppError.Network)
        override suspend fun sessions(branchId: String): AppResult<List<AcademicSession>> = AppResult.Success(emptyList())
        override suspend fun calendar(branchId: String, from: String?, to: String?): AppResult<List<CalendarEvent>> =
            AppResult.Success(emptyList())
        override suspend fun classes(schoolId: String?): AppResult<List<SchoolClass>> = AppResult.Success(listOf(SchoolClass("c5", "Class 5", 5, 6)))
        override suspend fun sections(branchId: String, sessionId: String?): AppResult<List<Section>> =
            AppResult.Success(listOf(Section("s1", "c5", "Class 5", "A", 30, null, 20, "ACTIVE")))
        override suspend fun subjects(schoolId: String?): AppResult<List<Subject>> = AppResult.Success(emptyList())
    }
}
