package com.schoolapp.feature.complaints

import com.schoolapp.core.model.ChildSummary
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.complaint.ComplaintCategory
import com.schoolapp.core.testing.FakeAuthRepository
import com.schoolapp.core.testing.MainDispatcherRule
import com.schoolapp.core.testing.TestSessions
import com.schoolapp.feature.complaints.file.FileComplaintViewModel
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

class FileComplaintViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val repository = FakeComplaintsRepository()
    private val parent = TestSessions.session(RoleKey.PARENT).copy(
        children = listOf(ChildSummary("k1", "Ayesha"), ChildSummary("k2", "Bilal")),
        activeChildId = "k2",
    )

    private fun viewModel() = FileComplaintViewModel(repository, FakeFilesRepository(), FakeAuthRepository(parent))

    @Test
    fun subject_and_description_are_required() {
        val vm = viewModel()
        vm.onCategorySelected(ComplaintCategory.FEE)
        vm.submit()
        val state = vm.uiState.value
        assertTrue(state.subjectMissing)
        assertTrue(state.descriptionMissing)
        assertFalse(state.categoryMissing)
        assertTrue(repository.filed.isEmpty())

        vm.onSubjectChange("Fee charged twice")
        assertFalse(vm.uiState.value.subjectMissing)
        vm.submit()
        assertTrue(vm.uiState.value.descriptionMissing)
        assertTrue(repository.filed.isEmpty())
    }

    @Test
    fun anonymous_flag_child_and_attachments_reach_the_input() {
        val vm = viewModel()
        assertEquals("k2", vm.uiState.value.childId)
        vm.onCategorySelected(ComplaintCategory.STAFF_BEHAVIOUR)
        vm.onSubjectChange(" Rude reply ")
        vm.onDescriptionChange("At pickup gate")
        vm.onAnonymousChange(true)
        vm.onAttach("content://doc")
        vm.submit()

        val input = repository.filed.single()
        assertTrue(input.anonymous)
        assertEquals("Rude reply", input.subject)
        assertEquals("k2", input.studentId)
        assertEquals(listOf("f1"), input.attachmentFileIds)
        assertEquals("c1", vm.uiState.value.filedId)
    }

    @Test
    fun not_about_a_child_sends_no_student_and_default_is_named() {
        val vm = viewModel()
        vm.onChildSelected(null)
        vm.onCategorySelected(ComplaintCategory.FACILITY)
        vm.onSubjectChange("Water cooler")
        vm.onDescriptionChange("Not working")
        vm.submit()
        val input = repository.filed.single()
        assertNull(input.studentId)
        assertFalse(input.anonymous)
    }
}
