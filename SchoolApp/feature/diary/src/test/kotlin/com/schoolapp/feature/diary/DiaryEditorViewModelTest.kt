package com.schoolapp.feature.diary

import androidx.lifecycle.SavedStateHandle
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.data.organisation.ScopedSections
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.diary.DiaryOutcome
import com.schoolapp.core.model.diary.DiaryStatus
import com.schoolapp.core.model.timetable.TeacherSlot
import com.schoolapp.core.testing.FakeAuthRepository
import com.schoolapp.core.testing.MainDispatcherRule
import com.schoolapp.core.testing.TestSessions
import com.schoolapp.feature.diary.editor.DiaryEditResult
import com.schoolapp.feature.diary.editor.DiaryEditResults
import com.schoolapp.feature.diary.editor.DiaryEditorViewModel
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

class DiaryEditorViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val diary = FakeDiaryRepository()
    private val files = FakeFilesRepository()
    private val organisation = FakeOrganisationRepository()
    private val results = DiaryEditResults()
    private val teacher = FakeAuthRepository(TestSessions.session(RoleKey.TEACHER, "diary.view", "diary.edit", "diary.publish"))
    private val slots = listOf(TeacherSlot("2026-10-05", 1, 1, "08:00", "08:40", "A", "Class 5", "Maths", "Sara Ali", null, false))

    private fun viewModel(auth: FakeAuthRepository = teacher, subjectId: String? = "math") = DiaryEditorViewModel(
        SavedStateHandle(mapOf("sectionId" to "s1", "date" to "2026-10-05", "subjectId" to subjectId, "title" to "Class 5 - A")),
        diary,
        files,
        com.schoolapp.feature.diary.subjects.TeacherSubjects(auth, FakeTimetableRepository(slots), organisation),
        ScopedSections(auth, organisation),
        auth,
        results,
    )

    @Test
    fun offline_publish_is_queued_and_retry_reuses_the_request_id() {
        val vm = viewModel()
        vm.onTopicsChange("Fractions")
        diary.nextError = AppError.Server(500, "SERVER", "Oops")
        vm.publish()
        assertEquals(AppError.Server(500, "SERVER", "Oops"), vm.uiState.value.error)
        assertNull(vm.uiState.value.result)

        diary.outcome = DiaryOutcome.Queued
        vm.publish()
        assertEquals(DiaryEditResult.QUEUED, vm.uiState.value.result)
        assertEquals(DiaryEditResult.QUEUED, results.latest.value)
        val keys = diary.publishCalls.map { it.second }
        assertEquals(2, keys.size)
        assertEquals(keys[0], keys[1])
        assertEquals(vm.clientRequestId, keys[0])
        assertEquals("math", diary.publishCalls.last().first.subjectId)
    }

    @Test
    fun helper_can_only_save_drafts() {
        val helper = FakeAuthRepository(TestSessions.session(RoleKey.HELPER, "diary.view", "diary.edit", "diary.publish"))
        diary.outcome = DiaryOutcome.Saved(entry("e1", "2026-10-05", DiaryStatus.DRAFT))
        val vm = viewModel(helper)
        assertTrue(vm.uiState.value.isHelper)
        assertFalse(vm.uiState.value.canPublish)
        vm.onTopicsChange("Reading")
        vm.publish()
        assertTrue(diary.publishCalls.isEmpty())
        vm.saveDraft()
        assertEquals(1, diary.draftCalls.size)
        assertEquals(DiaryEditResult.DRAFT_SAVED, vm.uiState.value.result)
    }

    @Test
    fun topics_are_required() {
        val vm = viewModel()
        vm.saveDraft()
        assertTrue(vm.uiState.value.topicsMissing)
        assertTrue(diary.draftCalls.isEmpty())
        vm.onTopicsChange("Fractions")
        assertFalse(vm.uiState.value.topicsMissing)
    }

    @Test
    fun locked_entry_after_closing_time_becomes_read_only() {
        val vm = viewModel()
        vm.onTopicsChange("Fractions")
        diary.nextError = AppError.Server(423, "LOCKED", "Closed")
        vm.publish()
        assertTrue(vm.uiState.value.locked)
        assertTrue(vm.uiState.value.isReadOnly)
        assertNull(vm.uiState.value.error)
    }

    @Test
    fun existing_entry_is_loaded_and_offline_upload_shows_error_without_attachment() {
        diary.entries = listOf(entry("e1", "2026-10-05", DiaryStatus.RETURNED).copy(topics = "Decimals", comment = "Add homework"))
        val vm = viewModel()
        assertEquals("Decimals", vm.uiState.value.topics)
        assertEquals("e1", vm.uiState.value.entry?.id)
        assertEquals(listOf("math"), vm.uiState.value.subjects.map { it.id })
        files.error = AppError.Network
        vm.onFilePicked("content://photo")
        assertEquals(AppError.Network, vm.uiState.value.uploadError)
        assertTrue(vm.uiState.value.attachments.isEmpty())
        assertFalse(vm.uiState.value.isUploading)
    }
}
