package com.schoolapp.feature.students

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.people.PersonProblem
import com.schoolapp.core.testing.FakeAuthRepository
import com.schoolapp.core.testing.MainDispatcherRule
import com.schoolapp.core.testing.TestSessions
import com.schoolapp.core.ui.people.ChildForm
import com.schoolapp.core.ui.people.GuardianForm
import com.schoolapp.feature.students.add.AddStudentViewModel
import com.schoolapp.feature.students.add.SectionOptionsLoader
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import java.time.LocalDateTime

class AddStudentViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val clock = AppClock { LocalDateTime.of(2026, 10, 8, 9, 0) }
    private val admin = FakeStudentAdmin()
    private val principal = FakeAuthRepository(TestSessions.session(RoleKey.PRINCIPAL, "students.view", "students.add", "students.edit"))

    private fun viewModel(auth: FakeAuthRepository = principal) = AddStudentViewModel(admin, SectionOptionsLoader(FakeOrganisation()), auth, clock)

    private fun AddStudentViewModel.fillValid() {
        onChildChange(ChildForm(firstName = "Test", lastName = "Student", dob = "2018-04-02", gender = "MALE"))
        onGuardianChange(0, GuardianForm(name = "Test Parent", relation = "FATHER", phone = "0300-1234567", isPrimary = true))
        onSectionChange("s1")
    }

    @Test
    fun needs_students_add() {
        val coordinator = FakeAuthRepository(TestSessions.session(RoleKey.COORDINATOR, "students.view"))
        assertFalse(viewModel(coordinator).uiState.value.canAdd)
        val state = viewModel().uiState.value
        assertTrue(state.canAdd)
        assertEquals("2026-10-08", state.admissionDate)
        assertEquals(listOf("Class 5 · A", "Class 5 · B"), state.sections.map { it.label })
        assertTrue("B is full", state.sections[1].isFull)
    }

    @Test
    fun empty_form_marks_each_required_field_by_api_path() {
        val vm = viewModel()
        vm.submit()
        val problems = vm.uiState.value.errors.problems
        assertEquals(PersonProblem.REQUIRED, problems["child.firstName"])
        assertEquals(PersonProblem.REQUIRED, problems["child.gender"])
        assertEquals(PersonProblem.REQUIRED, problems["guardians.0.phone"])
        assertEquals(PersonProblem.REQUIRED, problems["sectionId"])
        assertTrue(admin.registered.isEmpty())
    }

    @Test
    fun bad_bform_future_dob_and_duplicate_guardian_phones_are_caught() {
        val vm = viewModel()
        vm.fillValid()
        vm.onChildChange(vm.uiState.value.child.copy(bForm = "12345", dob = "2030-01-01"))
        vm.addGuardian()
        vm.onGuardianChange(1, GuardianForm(name = "Mother", relation = "MOTHER", phone = "03001234567"))
        vm.submit()
        val problems = vm.uiState.value.errors.problems
        assertEquals(PersonProblem.BAD_ID_NUMBER, problems["child.bForm"])
        assertEquals(PersonProblem.FUTURE_DATE, problems["child.dob"])
        assertEquals(PersonProblem.DUPLICATE_PHONE, problems["guardians.1.phone"])
    }

    @Test
    fun one_primary_guardian_and_removing_the_primary_moves_it() {
        val vm = viewModel()
        vm.addGuardian()
        vm.makePrimary(1)
        assertEquals(listOf(false, true), vm.uiState.value.guardians.map { it.isPrimary })
        vm.removeGuardian(1)
        assertEquals(listOf(true), vm.uiState.value.guardians.map { it.isPrimary })
    }

    @Test
    fun valid_form_registers_with_the_web_payload() {
        val vm = viewModel()
        vm.fillValid()
        vm.submit()
        val input = admin.registered.single()
        assertEquals("s1", input.sectionId)
        assertEquals("2026-10-08", input.admissionDate)
        assertNull(input.child.bForm)
        assertTrue(input.guardians.single().isPrimary)
        assertEquals("st-new", vm.uiState.value.created?.id)
    }

    @Test
    fun server_validation_lines_land_on_their_fields() {
        val vm = viewModel()
        vm.fillValid()
        admin.failWith = AppError.Validation("child.bForm must be 13 digits", mapOf("child.bForm" to "child.bForm must be 13 digits"))
        vm.submit()
        val state = vm.uiState.value
        assertEquals("child.bForm must be 13 digits", state.errors.server["child.bForm"])
        assertNull(state.submitError)
        assertFalse(state.submitting)
    }

    @Test
    fun section_full_conflict_is_a_banner() {
        val vm = viewModel()
        vm.fillValid()
        admin.failWith = AppError.Server(409, "CONFLICT", "Section is full")
        vm.submit()
        assertEquals("Section is full", (vm.uiState.value.submitError!!.error as AppError.Server).message)
        assertNull(vm.uiState.value.created)
    }
}
