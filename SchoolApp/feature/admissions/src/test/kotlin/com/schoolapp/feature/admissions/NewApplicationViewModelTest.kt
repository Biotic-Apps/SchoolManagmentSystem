package com.schoolapp.feature.admissions

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.organisation.OrganisationRepository
import com.schoolapp.core.data.people.StudentAdminRepository
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.organisation.AcademicSession
import com.schoolapp.core.model.organisation.SchoolClass
import com.schoolapp.core.model.people.ApplicationInput
import com.schoolapp.core.model.people.PersonProblem
import com.schoolapp.core.testing.FakeAuthRepository
import com.schoolapp.core.testing.MainDispatcherRule
import com.schoolapp.core.testing.TestSessions
import com.schoolapp.core.ui.people.ChildForm
import com.schoolapp.core.ui.people.GuardianForm
import com.schoolapp.feature.admissions.create.NewApplicationViewModel
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import java.lang.reflect.Proxy
import java.time.LocalDateTime

class NewApplicationViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val created = mutableListOf<ApplicationInput>()
    private var failWith: AppError? = null
    private var activeSession = true

    private val admin = Proxy.newProxyInstance(StudentAdminRepository::class.java.classLoader, arrayOf(StudentAdminRepository::class.java)) { _, method, args ->
        when (method.name) {
            "createApplication" -> {
                created += args[0] as ApplicationInput
                failWith?.let { AppResult.Failure(it) } ?: AppResult.Success("app-1")
            }
            else -> error("unexpected ${method.name}")
        }
    } as StudentAdminRepository

    private val organisation = Proxy.newProxyInstance(OrganisationRepository::class.java.classLoader, arrayOf(OrganisationRepository::class.java)) { _, method, _ ->
        when (method.name) {
            "sessions" -> AppResult.Success(listOf(AcademicSession("se1", "b1", "2026-27", "2026-04-01", "2027-03-31", if (activeSession) "ACTIVE" else "CLOSED", 3)))
            "classes" -> AppResult.Success(listOf(SchoolClass("c1", "Class 1", 1, 0), SchoolClass("c2", "Class 2", 2, 0)))
            else -> error("unexpected ${method.name}")
        }
    } as OrganisationRepository

    private fun viewModel(vararg permissions: String = arrayOf("admissions.view", "admissions.add")) = NewApplicationViewModel(
        admin, organisation, FakeAuthRepository(TestSessions.session(RoleKey.PRINCIPAL, *permissions)),
        AppClock { LocalDateTime.of(2026, 10, 8, 9, 0) },
    )

    private fun NewApplicationViewModel.fill() {
        onClass("c2")
        onChildChange(ChildForm(firstName = "Test", lastName = "Applicant", dob = "2019-05-05", gender = "FEMALE"))
        onGuardianChange(0, GuardianForm(name = "Test Parent", relation = "MOTHER", phone = "03001234567", isPrimary = true))
    }

    @Test
    fun needs_admissions_add_and_lists_classes() {
        assertFalse(viewModel("admissions.view").uiState.value.canAdd)
        val state = viewModel().uiState.value
        assertTrue(state.canAdd)
        assertEquals(listOf("Class 1", "Class 2"), state.classes.map { it.name })
        assertFalse(state.noSession)
    }

    @Test
    fun empty_form_flags_class_child_and_guardian() {
        val vm = viewModel()
        vm.submit()
        val problems = vm.uiState.value.errors.problems
        assertEquals(PersonProblem.REQUIRED, problems["classId"])
        assertEquals(PersonProblem.REQUIRED, problems["child.firstName"])
        assertEquals(PersonProblem.REQUIRED, problems["guardians.0.name"])
        assertTrue(created.isEmpty())
    }

    @Test
    fun valid_form_creates_the_application_for_branch_and_active_session() {
        val vm = viewModel()
        vm.fill()
        vm.onNotes("  ")
        vm.submit()
        val input = created.single()
        assertEquals(Triple("b1", "se1", "c2"), Triple(input.branchId, input.sessionId, input.classId))
        assertNull("blank notes left out", input.notes)
        assertEquals("app-1", vm.uiState.value.createdId)
    }

    @Test
    fun server_field_errors_go_on_the_fields() {
        val vm = viewModel()
        vm.fill()
        failWith = AppError.Validation("guardians.0.phone must be a valid phone number", mapOf("guardians.0.phone" to "guardians.0.phone must be a valid phone number"))
        vm.submit()
        assertEquals("guardians.0.phone must be a valid phone number", vm.uiState.value.errors.server["guardians.0.phone"])
        assertNull(vm.uiState.value.submitError)
        assertNull(vm.uiState.value.createdId)
    }

    @Test
    fun without_an_active_session_nothing_is_sent() {
        activeSession = false
        val vm = viewModel()
        assertTrue(vm.uiState.value.noSession)
        vm.fill()
        vm.submit()
        assertTrue(created.isEmpty())
    }
}
