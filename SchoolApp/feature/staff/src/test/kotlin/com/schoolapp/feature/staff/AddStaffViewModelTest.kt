package com.schoolapp.feature.staff

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.organisation.Branch
import com.schoolapp.core.testing.FakeAuthRepository
import com.schoolapp.core.testing.MainDispatcherRule
import com.schoolapp.core.testing.TestSessions
import com.schoolapp.feature.staff.add.AddStaffViewModel
import com.schoolapp.feature.staff.common.StaffEvents
import com.schoolapp.feature.staff.form.FieldProblem
import com.schoolapp.feature.staff.form.StaffField
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import java.time.LocalDateTime

class AddStaffViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val clock = AppClock { LocalDateTime.of(2026, 10, 8, 9, 0) }
    private val principal = FakeAuthRepository(TestSessions.session(RoleKey.PRINCIPAL, "staff.view", "staff.add", "staff.edit"))
    private val repository = FakeStaffAdminRepository()
    private val events = StaffEvents()

    private fun vm(auth: FakeAuthRepository = principal, org: FakeOrganisationRepository = FakeOrganisationRepository()) =
        AddStaffViewModel(repository, auth, org, events, clock)

    private fun AddStaffViewModel.fill(email: String = "sana@school.pk", phone: String = "", designation: String? = "TEACHER") =
        onFormChange(uiState.value.form.copy(name = "Sana Iqbal", email = email, phone = phone, designation = designation))

    @Test
    fun defaults_create_account_on_and_join_date_today() {
        val state = vm().uiState.value
        assertTrue(state.canAdd)
        assertTrue(state.createAccount)
        assertEquals("2026-10-08", state.form.joinDate)
        assertEquals("b1", state.branchId)
    }

    @Test
    fun empty_form_shows_inline_errors_and_sends_nothing() {
        val vm = vm()
        vm.submit()
        val errors = vm.uiState.value.errors
        assertEquals(FieldProblem.REQUIRED, errors[StaffField.NAME])
        assertEquals(FieldProblem.CONTACT_FOR_ACCOUNT, errors[StaffField.EMAIL])
        assertEquals(FieldProblem.REQUIRED, errors[StaffField.DESIGNATION])
        assertTrue(repository.created.isEmpty())
    }

    @Test
    fun account_needs_contact_but_record_alone_does_not() {
        val vm = vm()
        vm.fill(email = "")
        vm.submit()
        assertEquals(FieldProblem.CONTACT_FOR_ACCOUNT, vm.uiState.value.errors[StaffField.EMAIL])

        vm.onCreateAccountChange(false)
        assertNull(vm.uiState.value.errors[StaffField.EMAIL])
        vm.submit()
        assertEquals(1, repository.created.size)
        assertFalse(repository.created.single().createAccount)
    }

    @Test
    fun malformed_email_phone_and_cnic_are_caught_inline() {
        val vm = vm()
        vm.fill(email = "sana@", phone = "12")
        vm.onFormChange(vm.uiState.value.form.copy(cnic = "1234"))
        vm.submit()
        val errors = vm.uiState.value.errors
        assertEquals(FieldProblem.INVALID_EMAIL, errors[StaffField.EMAIL])
        assertEquals(FieldProblem.INVALID_PHONE, errors[StaffField.PHONE])
        assertEquals(FieldProblem.INVALID_CNIC, errors[StaffField.CNIC])
        assertTrue(repository.created.isEmpty())

        vm.onFormChange(vm.uiState.value.form.copy(email = "sana@school.pk"))
        assertNull("editing a field clears its error", vm.uiState.value.errors[StaffField.EMAIL])
    }

    @Test
    fun success_shows_the_temporary_password_once_and_refreshes_lists() {
        val vm = vm()
        vm.fill(phone = "0300 1234567", designation = "HELPER")
        vm.submit()
        val state = vm.uiState.value
        val sent = repository.created.single()
        assertEquals("b1", sent.branchId)
        assertTrue(sent.createAccount)
        assertEquals("HELPER", sent.roleKey)
        assertEquals("Sana Iqbal", sent.profile.name)
        assertEquals("2026-10-08", sent.profile.joinDate)
        assertEquals("Tmp-7Kx9-pQ2", state.created?.temporaryPassword)
        assertTrue(state.showCredentials)
        assertFalse(state.offerAssign)
        assertEquals(1, events.changes.value)

        vm.submit()
        assertEquals("no second create from the success screen", 1, repository.created.size)
    }

    @Test
    fun teachers_are_offered_the_assign_step_and_role_can_be_changed() {
        val vm = vm()
        vm.fill()
        vm.onRoleChange("COORDINATOR")
        vm.submit()
        assertEquals("COORDINATOR", repository.created.single().roleKey)
        assertTrue(vm.uiState.value.offerAssign)
    }

    @Test
    fun duplicate_login_is_pinned_on_the_contact_fields() {
        repository.failWith = AppError.Server(409, "CONFLICT", "That login already has a staff record")
        val vm = vm()
        vm.fill()
        vm.submit()
        val state = vm.uiState.value
        assertNull(state.created)
        assertFalse(state.isSaving)
        assertEquals(FieldProblem.EMAIL_TAKEN, state.errors[StaffField.EMAIL])
        assertEquals(repository.failWith, state.error)
        assertEquals(0, events.changes.value)
    }

    @Test
    fun duplicate_employee_number_is_pinned_on_its_field() {
        repository.failWith = AppError.Server(409, "CONFLICT", "Employee number already exists")
        val vm = vm()
        vm.fill()
        vm.submit()
        assertEquals(FieldProblem.EMPLOYEE_NO_TAKEN, vm.uiState.value.errors[StaffField.EMPLOYEE_NO])
    }

    @Test
    fun roles_without_staff_add_cannot_submit() {
        val teacher = FakeAuthRepository(TestSessions.session(RoleKey.TEACHER, "staff.view"))
        val vm = vm(auth = teacher)
        assertFalse(vm.uiState.value.canAdd)
        vm.fill()
        vm.submit()
        assertTrue(repository.created.isEmpty())
    }

    @Test
    fun admin_without_own_branch_must_pick_one() {
        val admin = FakeAuthRepository(TestSessions.session(RoleKey.SUPER_ADMIN, "staff.add", branchId = null))
        val branches = listOf(branch("b1", "Main"), branch("b2", "City"))
        val vm = vm(auth = admin, org = FakeOrganisationRepository(branches))
        assertTrue(vm.uiState.value.needsBranchPick)
        vm.fill()
        vm.submit()
        assertEquals(FieldProblem.REQUIRED, vm.uiState.value.errors[StaffField.BRANCH])
        vm.onBranchChange("b2")
        vm.submit()
        assertEquals("b2", repository.created.single().branchId)
    }

    private fun branch(id: String, name: String) = Branch(id, "s1", "Bright School", null, name, null, null, null, null, emptyList(), null, "ACTIVE")
}
