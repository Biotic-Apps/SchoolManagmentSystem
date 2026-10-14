package com.schoolapp.feature.notices

import androidx.lifecycle.SavedStateHandle
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.files.FilesRepository
import com.schoolapp.core.data.notices.NoticesRepository
import com.schoolapp.core.data.organisation.OrganisationRepository
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.files.FilePurpose
import com.schoolapp.core.model.files.UploadedFile
import com.schoolapp.core.model.notice.Notice
import com.schoolapp.core.model.notice.NoticeInput
import com.schoolapp.core.model.notice.NoticeReads
import com.schoolapp.core.model.notice.NoticeStatus
import com.schoolapp.core.model.organisation.AcademicSession
import com.schoolapp.core.model.organisation.Branch
import com.schoolapp.core.model.organisation.BranchOverview
import com.schoolapp.core.model.organisation.CalendarEvent
import com.schoolapp.core.model.organisation.SchoolClass
import com.schoolapp.core.model.organisation.Section
import com.schoolapp.core.model.organisation.Subject
import com.schoolapp.core.model.settings.PagedList
import com.schoolapp.core.testing.FakeAuthRepository
import com.schoolapp.core.testing.MainDispatcherRule
import com.schoolapp.core.testing.TestSessions
import com.schoolapp.feature.notices.compose.AudienceOptionsLoader
import com.schoolapp.feature.notices.compose.NoticeComposeViewModel
import com.schoolapp.feature.notices.feed.NoticesFeedViewModel
import org.junit.Assert.assertEquals
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

    private fun notice(id: String, isRead: Boolean = false) =
        Notice(id, "Title $id", "Body", NoticeStatus.PUBLISHED, false, "2026-10-01T08:00:00Z", null, "Principal", null, isRead)

    private fun compose(repository: FakeNoticesRepository) = NoticeComposeViewModel(
        SavedStateHandle(), repository, FakeFiles(), AudienceOptionsLoader(FakeOrganisationRepository()), principal, events, clock,
    )

    @Test
    fun feed_loads_published_notices_of_the_branch() {
        val repository = FakeNoticesRepository(listOf(notice("n1"), notice("n2")))
        val vm = NoticesFeedViewModel(repository, principal, events)
        assertEquals(listOf("n1", "n2"), vm.uiState.value.page.items.map { it.id })
        assertTrue(vm.uiState.value.canAdd)
        assertEquals("b1" to NoticeStatus.PUBLISHED, repository.queries.single())
    }

    @Test
    fun opening_a_notice_marks_it_read_once() {
        val repository = FakeNoticesRepository(listOf(notice("n1"), notice("n2", isRead = true)))
        val vm = NoticesFeedViewModel(repository, principal, events)
        vm.onOpen("n1")
        vm.onOpen("n1")
        vm.onOpen("n2")
        assertEquals(listOf("n1"), repository.reads)
        assertEquals(true, events.opened("n1")?.isRead)
    }

    @Test
    fun compose_validates_then_saves_a_draft_for_the_active_branch() {
        val repository = FakeNoticesRepository(emptyList())
        val vm = compose(repository)
        vm.saveDraft()
        assertTrue(vm.uiState.value.titleMissing)
        assertTrue(vm.uiState.value.bodyMissing)
        assertTrue(repository.saved.isEmpty())

        vm.onTitleChange("Sports day")
        vm.onBodyChange("Friday")
        vm.saveDraft()
        assertEquals(listOf("b1"), repository.saved.single().audience.branchIds)
        assertEquals(NoticeComposeResult.DRAFT_SAVED, vm.uiState.value.result)
        assertTrue(repository.published.isEmpty())
    }

    @Test
    fun publish_saves_then_publishes_and_reports_review() {
        val repository = FakeNoticesRepository(emptyList()).apply { publishStatus = NoticeStatus.PENDING_REVIEW }
        val vm = compose(repository)
        vm.onTitleChange("Trip")
        vm.onBodyChange("Museum")
        vm.onAudienceChange { it.copy(schoolWide = true) }
        vm.publish()
        assertTrue(repository.saved.single().audience.schoolWide)
        assertEquals(listOf("new"), repository.published)
        assertEquals(NoticeComposeResult.SENT_FOR_APPROVAL, vm.uiState.value.result)
    }

    private class FakeNoticesRepository(private val notices: List<Notice>) : NoticesRepository {
        val reads = mutableListOf<String>()
        val saved = mutableListOf<NoticeInput>()
        val published = mutableListOf<String>()
        val queries = mutableListOf<Pair<String?, NoticeStatus?>>()
        var publishStatus = NoticeStatus.PUBLISHED

        override suspend fun notices(branchId: String?, status: NoticeStatus?, page: Int, pageSize: Int): AppResult<PagedList<Notice>> {
            queries += branchId to status
            return AppResult.Success(PagedList(notices, page, pageSize, notices.size))
        }

        override suspend fun save(id: String?, input: NoticeInput): AppResult<Notice> {
            saved += input
            return AppResult.Success(Notice(id ?: "new", input.title, input.body, NoticeStatus.DRAFT, input.pinned, null, null, null, null, true))
        }

        override suspend fun publish(id: String, draft: Notice?): AppResult<Notice> {
            published += id
            return AppResult.Success(draft!!.copy(status = publishStatus))
        }

        override suspend fun markRead(id: String): AppResult<Unit> {
            reads += id
            return AppResult.Success(Unit)
        }

        override suspend fun reads(id: String): AppResult<NoticeReads> = AppResult.Success(NoticeReads(10, 4, 6))
    }

    private class FakeFiles : FilesRepository {
        override suspend fun upload(uri: String, purpose: FilePurpose): AppResult<UploadedFile> = AppResult.Failure(AppError.Network)
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
