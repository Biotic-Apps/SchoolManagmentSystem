package com.schoolapp.feature.staff

import androidx.lifecycle.SavedStateHandle
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.testing.FakeAuthRepository
import com.schoolapp.core.testing.MainDispatcherRule
import com.schoolapp.core.testing.TestSessions
import com.schoolapp.feature.staff.account.StaffAccountViewModel
import com.schoolapp.feature.staff.common.StaffEvents
import com.schoolapp.feature.staff.form.FieldProblem
import com.schoolapp.feature.staff.form.StaffField
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

class StaffAccountViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val principal = FakeAuthRepository(TestSessions.session(RoleKey.PRINCIPAL, "staff.edit", "users.add", "users.edit"))
    private val repository = FakeStaffAdminRepository()
    private val events = StaffEvents()
    private val handle = SavedStateHandle(mapOf("id" to "st1"))

    @Test
    fun create_and_reset_need_users_permissions_too() {
        val vm = StaffAccountViewModel(handle, repository, principal, events)
        assertTrue(vm.uiState.value.canCreate)
        assertTrue(vm.uiState.value.canReset)
        val editorOnly = FakeAuthRepository(TestSessions.session(RoleKey.COORDINATOR, "staff.edit"))
        val limited = StaffAccountViewModel(handle, repository, editorOnly, events)
        assertFalse(limited.uiState.value.canCreate)
        assertFalse(limited.uiState.value.canReset)
    }

    @Test
    fun create_sign_in_prefills_contact_and_shows_password_once() {
        val vm = StaffAccountViewModel(handle, repository, principal, events)
        vm.openCreate(detail(summary(userId = null)))
        val form = vm.uiState.value.createForm!!
        assertEquals("ayesha@school.pk", form.email)
        assertEquals("TEACHER", form.roleKey)

        vm.onCreateChange(form.copy(email = "", phone = ""))
        vm.submitCreate("Ayesha Khan")
        assertEquals(FieldProblem.CONTACT_FOR_ACCOUNT, vm.uiState.value.createForm!!.errors[StaffField.EMAIL])
        assertTrue(repository.accountCalls.isEmpty())

        vm.onCreateChange(vm.uiState.value.createForm!!.copy(phone = "03001234567"))
        vm.submitCreate("Ayesha Khan")
        assertNull(vm.uiState.value.createForm)
        assertEquals("Tmp-7Kx9-pQ2", vm.uiState.value.issued?.password)
        assertEquals("03001234567", vm.uiState.value.issued?.signIn)
        assertEquals(1, events.changes.value)
        vm.closeIssued()
        assertNull(vm.uiState.value.issued)
    }

    @Test
    fun create_sign_in_conflict_stays_on_the_form() {
        repository.failWith = AppError.Server(409, "CONFLICT", "That login already has a staff record")
        val vm = StaffAccountViewModel(handle, repository, principal, events)
        vm.openCreate(detail(summary(userId = null)))
        vm.submitCreate("Ayesha Khan")
        val form = vm.uiState.value.createForm
        assertNotNull(form)
        assertEquals(FieldProblem.EMAIL_TAKEN, form!!.errors[StaffField.EMAIL])
        assertNull(vm.uiState.value.issued)
    }

    @Test
    fun reset_asks_first_then_shows_the_new_password() {
        val vm = StaffAccountViewModel(handle, repository, principal, events)
        vm.askReset()
        assertTrue(vm.uiState.value.confirmReset)
        vm.confirmReset("Ayesha Khan", "ayesha@school.pk")
        assertEquals(1, repository.resetCalls)
        assertFalse(vm.uiState.value.confirmReset)
        assertEquals("New-Pass-123", vm.uiState.value.issued?.password)
    }
}
