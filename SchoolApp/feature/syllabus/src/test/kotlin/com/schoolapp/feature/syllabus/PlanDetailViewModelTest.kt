package com.schoolapp.feature.syllabus

import androidx.lifecycle.SavedStateHandle
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.syllabus.SyllabusRepository
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.syllabus.BookList
import com.schoolapp.core.model.syllabus.CoverageRow
import com.schoolapp.core.model.syllabus.PlanProgress
import com.schoolapp.core.model.syllabus.ProgressOutcome
import com.schoolapp.core.model.syllabus.SyllabusChapter
import com.schoolapp.core.model.syllabus.SyllabusPlan
import com.schoolapp.core.model.syllabus.SyllabusTopic
import com.schoolapp.core.model.syllabus.TopicProgressUpdate
import com.schoolapp.core.model.syllabus.TopicStatus
import com.schoolapp.core.testing.FakeAuthRepository
import com.schoolapp.core.testing.MainDispatcherRule
import com.schoolapp.core.testing.TestSessions
import com.schoolapp.feature.syllabus.detail.PlanDetailViewModel
import com.schoolapp.feature.syllabus.detail.ProgressMessage
import kotlinx.coroutines.flow.MutableStateFlow
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import java.time.LocalDateTime

class PlanDetailViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val topic = SyllabusTopic("t1", "Fractions", 1, "2026-10-01", TopicStatus.IN_PROGRESS, null, true, false)
    private val plan = SyllabusPlan(
        "p1", "s1", "A", "Class 5", "m", "Maths", 1, "APPROVED",
        listOf(SyllabusChapter("c1", "Numbers", 1, listOf(topic, topic.copy(id = "t2", status = TopicStatus.NOT_STARTED)))),
        PlanProgress(2, 0, 1, 0),
    )
    private val repository = FakeSyllabusRepository(plan)
    private val auth = FakeAuthRepository(TestSessions.session(RoleKey.TEACHER, "syllabus.view", "syllabus.edit"))
    private val clock = AppClock { LocalDateTime.of(2026, 10, 5, 10, 0) }

    private fun viewModel() = PlanDetailViewModel(
        SavedStateHandle(mapOf("planId" to "p1", "sectionId" to "s1", "subjectId" to "m")), repository, auth, clock,
    )

    @Test
    fun applied_update_changes_topic_and_progress() {
        val vm = viewModel()
        vm.onTopicSelected("t1")
        vm.onStatusChange(TopicStatus.COMPLETED)
        assertEquals("2026-10-05", vm.uiState.value.editor?.completedOn)
        vm.save()
        val state = vm.uiState.value
        assertNull(state.editor)
        assertEquals(ProgressMessage.SAVED, state.message)
        assertEquals(TopicStatus.COMPLETED, state.plan!!.chapters[0].topics[0].status)
        assertEquals(PlanProgress(2, 1, 1, 50), state.plan!!.progress)
        assertEquals(TopicProgressUpdate(TopicStatus.COMPLETED, "2026-10-05", ""), repository.updates.single().second)
    }

    @Test
    fun probation_response_marks_topic_pending_review_without_applying() {
        repository.outcome = ProgressOutcome.PendingReview("ap1")
        val vm = viewModel()
        vm.onTopicSelected("t1")
        vm.onStatusChange(TopicStatus.COMPLETED)
        vm.save()
        val state = vm.uiState.value
        assertEquals(ProgressMessage.PENDING_REVIEW, state.message)
        val updated = state.plan!!.chapters[0].topics[0]
        assertTrue(updated.pendingReview)
        assertEquals(TopicStatus.IN_PROGRESS, updated.status)
    }

    @Test
    fun offline_save_is_queued_and_shown_as_waiting_to_sync() {
        repository.outcome = ProgressOutcome.Queued
        val vm = viewModel()
        vm.onTopicSelected("t2")
        val key = vm.uiState.value.editor!!.clientRequestId
        vm.onStatusChange(TopicStatus.IN_PROGRESS)
        vm.save()
        assertEquals(ProgressMessage.QUEUED, vm.uiState.value.message)
        assertEquals("t2" to key, repository.updates.single().first to repository.keys.single())
        repository.queued.value = setOf("t2")
        assertEquals(setOf("t2"), vm.uiState.value.queuedTopicIds)
    }

    @Test
    fun failed_save_keeps_sheet_with_same_request_id_for_retry() {
        repository.error = AppError.Server(409, "CONFLICT", "Locked")
        val vm = viewModel()
        vm.onTopicSelected("t1")
        val key = vm.uiState.value.editor!!.clientRequestId
        vm.save()
        val editor = vm.uiState.value.editor
        assertNotNull(editor)
        assertEquals(key, editor!!.clientRequestId)
        assertFalse(editor.isSaving)
        assertEquals(AppError.Server(409, "CONFLICT", "Locked"), editor.error)
    }

    @Test
    fun completed_requires_a_date_and_viewers_cannot_edit() {
        val vm = viewModel()
        vm.onTopicSelected("t1")
        vm.onStatusChange(TopicStatus.COMPLETED)
        vm.onCompletedOnChange("")
        vm.save()
        assertTrue(vm.uiState.value.editor!!.dateMissing)
        assertTrue(repository.updates.isEmpty())

        auth.sessionState.value = TestSessions.session(RoleKey.PARENT, "syllabus.view")
        val parentVm = viewModel()
        parentVm.onTopicSelected("t1")
        assertNull(parentVm.uiState.value.editor)
    }

    private class FakeSyllabusRepository(private val plan: SyllabusPlan) : SyllabusRepository {
        val queued = MutableStateFlow<Set<String>>(emptySet())
        val updates = mutableListOf<Pair<String, TopicProgressUpdate>>()
        val keys = mutableListOf<String>()
        var outcome: ProgressOutcome = ProgressOutcome.Applied
        var error: AppError? = null

        override val queuedTopicIds = queued
        override suspend fun plans(sectionId: String?, subjectId: String?) = AppResult.Success(listOf(plan))
        override suspend fun updateProgress(topicId: String, update: TopicProgressUpdate, clientRequestId: String): AppResult<ProgressOutcome> {
            error?.let { return AppResult.Failure(it) }
            updates += topicId to update
            keys += clientRequestId
            return AppResult.Success(outcome)
        }
        override suspend fun coverage(): AppResult<List<CoverageRow>> = AppResult.Success(emptyList())
        override suspend fun bookLists(): AppResult<List<BookList>> = AppResult.Success(emptyList())
    }
}
