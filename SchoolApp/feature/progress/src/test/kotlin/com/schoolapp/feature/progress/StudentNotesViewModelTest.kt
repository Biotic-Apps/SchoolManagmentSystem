package com.schoolapp.feature.progress

import androidx.lifecycle.SavedStateHandle
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.progress.ProgressCategory
import com.schoolapp.core.model.progress.ProgressNoteOutcome
import com.schoolapp.core.testing.FakeAuthRepository
import com.schoolapp.core.testing.MainDispatcherRule
import com.schoolapp.core.testing.TestSessions
import com.schoolapp.feature.progress.notes.NoteError
import com.schoolapp.feature.progress.notes.NoteMessage
import com.schoolapp.feature.progress.notes.StudentNotesViewModel
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

class StudentNotesViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val handle = SavedStateHandle(mapOf("studentId" to "st1", "studentName" to "Ayesha Khan", "rollNo" to 1))
    private val teacher = FakeAuthRepository(TestSessions.session(RoleKey.TEACHER, "progress.view", "progress.edit"))

    @Test
    fun add_requires_category_and_note() {
        val repo = FakeProgressRepository()
        val vm = StudentNotesViewModel(handle, repo, teacher)
        assertTrue(vm.uiState.value.canAdd)
        vm.openForm()
        vm.submit()
        val form = vm.uiState.value.form!!
        assertTrue(form.categoryMissing)
        assertEquals(NoteError.REQUIRED, form.noteError)

        vm.onCategoryChange(ProgressCategory.BEHAVIOUR)
        vm.onNoteChange("x".repeat(1001))
        vm.submit()
        assertEquals(NoteError.TOO_LONG, vm.uiState.value.form!!.noteError)
        assertTrue(repo.addCalls.isEmpty())
    }

    @Test
    fun saving_sends_visibility_flag_and_prepends_note() {
        val repo = FakeProgressRepository()
        val vm = StudentNotesViewModel(handle, repo, teacher)
        vm.openForm()
        assertTrue(vm.uiState.value.form!!.visibleToParent)
        vm.onCategoryChange(ProgressCategory.LEARNING)
        vm.onNoteChange("  Needs practice with fractions  ")
        vm.onVisibleChange(false)
        vm.submit()
        val (studentId, input) = repo.addCalls.single()
        assertEquals("st1", studentId)
        assertEquals("Needs practice with fractions", input.note)
        assertFalse(input.visibleToParent)
        assertNull(vm.uiState.value.form)
        assertEquals(NoteMessage.SAVED, vm.uiState.value.message)
        assertEquals(listOf("n_new"), vm.uiState.value.notes.map { it.id })
    }

    @Test
    fun probation_note_reports_pending_review() {
        val repo = FakeProgressRepository().apply { outcome = ProgressNoteOutcome.PendingReview("ap1") }
        val vm = StudentNotesViewModel(handle, repo, teacher)
        vm.openForm()
        vm.onCategoryChange(ProgressCategory.HOMEWORK)
        vm.onNoteChange("Homework done well")
        vm.submit()
        assertEquals(NoteMessage.PENDING_REVIEW, vm.uiState.value.message)
        assertNull(vm.uiState.value.form)
        assertTrue(vm.uiState.value.notes.isEmpty())
    }

    @Test
    fun without_edit_permission_form_does_not_open() {
        val viewer = FakeAuthRepository(TestSessions.session(RoleKey.PRINCIPAL, "progress.view"))
        val vm = StudentNotesViewModel(handle, FakeProgressRepository(), viewer)
        assertFalse(vm.uiState.value.canAdd)
        vm.openForm()
        assertNull(vm.uiState.value.form)
        assertEquals(1, vm.uiState.value.rollNo)
    }
}
