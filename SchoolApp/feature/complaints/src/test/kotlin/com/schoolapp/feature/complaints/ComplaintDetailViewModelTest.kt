package com.schoolapp.feature.complaints

import androidx.lifecycle.SavedStateHandle
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.User
import com.schoolapp.core.model.common.PersonRef
import com.schoolapp.core.model.complaint.ComplaintStatus
import com.schoolapp.core.testing.FakeAuthRepository
import com.schoolapp.core.testing.MainDispatcherRule
import com.schoolapp.core.testing.TestSessions
import com.schoolapp.feature.complaints.detail.ComplaintDetailViewModel
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

class ComplaintDetailViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val repository = FakeComplaintsRepository()
    private val files = FakeFilesRepository()
    private val staff = FakeStaffRepository(
        listOf(
            staffMember("st1", "Zara Khan", userId = "u7"),
            staffMember("st2", "Ali Raza", userId = "u8", designation = "Coordinator"),
            staffMember("st3", "No Login", userId = null),
            staffMember("st4", "Left School", userId = "u10", status = "INACTIVE"),
            staffMember("st5", "Accused", userId = "u-against"),
        ),
    )

    private fun session(userId: String, vararg permissions: String) =
        TestSessions.session(RoleKey.COORDINATOR, *permissions, user = User(id = userId, fullName = "Viewer"))

    private fun viewModel(userId: String = "u5", permissions: Array<String> = arrayOf(EDIT)) = ComplaintDetailViewModel(
        SavedStateHandle(mapOf("complaintId" to "c1")),
        repository,
        FakeAuthRepository(session(userId, *permissions)),
        files,
        staff,
    )

    @Test
    fun assign_needs_the_edit_permission_and_an_open_complaint() {
        assertTrue(viewModel().uiState.value.detail!!.canAssign)
        assertFalse(viewModel(permissions = emptyArray()).uiState.value.detail!!.canAssign)

        repository.current = complaint(status = ComplaintStatus.RESOLVED)
        assertFalse(viewModel().uiState.value.detail!!.canAssign)
        repository.current = complaint(status = ComplaintStatus.CLOSED)
        assertFalse(viewModel().uiState.value.detail!!.canAssign)
    }

    @Test
    fun assign_without_permission_does_not_open_the_sheet() {
        val vm = viewModel(permissions = emptyArray())
        vm.onAssign()
        assertNull(vm.uiState.value.assignEditor)
        assertEquals(0, staff.listCalls)
    }

    @Test
    fun candidates_are_active_logins_except_the_person_complained_about() {
        repository.current = complaint(against = PersonRef("u-against", "Accused"))
        val vm = viewModel()
        vm.onAssign()

        val editor = vm.uiState.value.assignEditor!!
        assertFalse(editor.isLoading)
        assertEquals(listOf("u8", "u7"), editor.candidates.map { it.userId })
        assertEquals("u2", editor.currentAssigneeId)

        vm.onAssigneeQueryChange("coord")
        assertEquals(listOf("u8"), vm.uiState.value.assignEditor!!.visible.map { it.userId })
    }

    @Test
    fun assign_requires_a_selection_then_posts_and_refreshes() {
        val vm = viewModel()
        vm.onAssign()
        vm.saveAssign()
        assertTrue(vm.uiState.value.assignEditor!!.selectionMissing)
        assertTrue(repository.assigned.isEmpty())

        vm.onAssigneeSelected("u7")
        vm.saveAssign()

        assertEquals(listOf("c1" to "u7"), repository.assigned)
        val state = vm.uiState.value
        assertNull(state.assignEditor)
        assertEquals("u7", state.detail!!.complaint.assignee?.id)
    }

    @Test
    fun staff_load_failure_shows_retry_state() {
        staff.failWith = AppError.Network
        val vm = viewModel()
        vm.onAssign()
        assertEquals(AppError.Network, vm.uiState.value.assignEditor!!.loadError)

        staff.failWith = null
        vm.loadAssignees()
        val editor = vm.uiState.value.assignEditor!!
        assertNull(editor.loadError)
        assertEquals(3, editor.candidates.size)
    }

    @Test
    fun update_attachments_reach_the_repository() {
        val vm = viewModel(userId = "u2")
        vm.onAddUpdate()
        vm.onUpdateMessageChange("Fan replaced")
        vm.onUpdateAttach("content://a")
        vm.onUpdateAttach("content://b")
        vm.onUpdateRemoveAttachment("f1")
        vm.saveUpdate()

        val call = repository.updates.single()
        assertEquals("Fan replaced", call.message)
        assertEquals(listOf("f2"), call.attachmentFileIds)
        assertNull(vm.uiState.value.updateEditor)
    }

    @Test
    fun complainant_comment_can_carry_attachments_and_is_capped_at_three() {
        repository.current = complaint(complainant = PersonRef("u9", "Hina"))
        val vm = viewModel(userId = "u9", permissions = emptyArray())
        vm.onAddUpdate()
        val editor = vm.uiState.value.updateEditor
        assertNotNull(editor)
        assertFalse(editor!!.allowStatus)
        repeat(4) { vm.onUpdateAttach("content://$it") }
        assertEquals(3, vm.uiState.value.updateEditor!!.attachments.items.size)

        vm.onUpdateMessageChange("Still broken")
        vm.saveUpdate()
        assertEquals(listOf("f1", "f2", "f3"), repository.updates.single().attachmentFileIds)
    }

    @Test
    fun failed_upload_shows_the_error_and_keeps_the_sheet_open() {
        files.failWith = AppError.Network
        val vm = viewModel(userId = "u2")
        vm.onAddUpdate()
        vm.onUpdateAttach("content://a")

        val editor = vm.uiState.value.updateEditor!!
        assertEquals(AppError.Network, editor.error)
        assertFalse(editor.attachments.isUploading)
        assertTrue(editor.attachments.items.isEmpty())
    }

    private companion object {
        const val EDIT = "complaints.edit"
    }
}
