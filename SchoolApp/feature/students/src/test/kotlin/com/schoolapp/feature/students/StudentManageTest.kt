package com.schoolapp.feature.students

import androidx.lifecycle.SavedStateHandle
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.people.EnrollmentChange
import com.schoolapp.core.model.people.PersonProblem
import com.schoolapp.core.testing.FakeAuthRepository
import com.schoolapp.core.testing.MainDispatcherRule
import com.schoolapp.core.testing.TestSessions
import com.schoolapp.feature.students.add.SectionOptionsLoader
import com.schoolapp.feature.students.detail.StudentDetailViewModel
import com.schoolapp.feature.students.manage.ManageController
import com.schoolapp.feature.students.manage.ManageNotice
import com.schoolapp.feature.students.manage.ManageSheet
import com.schoolapp.feature.students.manage.PlacementKind
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import java.time.LocalDateTime

class StudentManageTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val admin = FakeStudentAdmin()
    private val students = FakeStudentsRepository()

    private fun viewModel(vararg permissions: String) = StudentDetailViewModel(
        SavedStateHandle(mapOf("id" to "st1")), students, admin, FakeGuardiansRepository(), FakeOrganisation(),
        SectionOptionsLoader(FakeOrganisation()), FakeAuthRepository(TestSessions.session(RoleKey.PRINCIPAL, *permissions)),
        AppClock { LocalDateTime.of(2026, 10, 8, 9, 0) },
    )

    @Test
    fun actions_need_students_edit() {
        assertFalse(viewModel("students.view").uiState.value.canAct)
        val vm = viewModel("students.view", "students.edit")
        assertTrue(vm.uiState.value.canAct)
        assertFalse(vm.uiState.value.canEditGuardians)
        vm.manage.openEditGuardian("g1")
        assertNull(vm.uiState.value.sheet)
    }

    @Test
    fun edit_prefills_from_the_profile_and_saves() {
        val vm = viewModel("students.edit")
        vm.manage.openEdit()
        val sheet = vm.uiState.value.sheet as ManageSheet.Edit
        assertEquals("Child", sheet.form.firstName)
        assertEquals("st1", sheet.form.lastName)
        vm.manage.onEditChange(sheet.form.copy(dob = "2017-01-01", gender = "FEMALE"))
        vm.manage.saveEdit()
        assertEquals("FEMALE", admin.updates.single().gender)
        assertNull("blank B-Form keeps the stored one", admin.updates.single().bForm)
        assertEquals(ManageNotice.SAVED, vm.uiState.value.notice)
        assertNull(vm.uiState.value.sheet)
    }

    @Test
    fun withdraw_needs_a_reason() {
        val vm = viewModel("students.edit")
        vm.manage.openPlacement(PlacementKind.WITHDRAW)
        vm.manage.savePlacement()
        assertEquals(PersonProblem.REQUIRED, (vm.uiState.value.sheet as ManageSheet.Placement).errors.problems[ManageController.REASON])
        vm.manage.onReason("Family moved")
        vm.manage.savePlacement()
        assertEquals(EnrollmentChange.Withdraw("2026-10-08", "Family moved"), admin.changes.single())
        assertEquals(ManageNotice.WITHDRAWN, vm.uiState.value.notice)
    }

    @Test
    fun change_section_offers_other_sections_and_shows_server_errors() {
        val vm = viewModel("students.edit")
        vm.manage.openPlacement(PlacementKind.CHANGE_SECTION)
        val sheet = vm.uiState.value.sheet as ManageSheet.Placement
        assertEquals("current section s1 left out", listOf("s2"), sheet.options.map { it.id })
        vm.manage.onTarget("s2")
        vm.manage.onReason("Parents asked")
        admin.failWith = AppError.Server(409, "CONFLICT", "Section is full")
        vm.manage.savePlacement()
        val failed = vm.uiState.value.sheet as ManageSheet.Placement
        assertFalse(failed.saving)
        assertEquals("Section is full", (failed.error!!.error as AppError.Server).message)
    }

    @Test
    fun transfer_lists_other_branches() {
        val vm = viewModel("students.edit")
        vm.manage.openPlacement(PlacementKind.TRANSFER)
        assertEquals(listOf("Main Branch", "City Branch"), (vm.uiState.value.sheet as ManageSheet.Placement).options.map { it.label })
        vm.manage.onTarget("b2")
        vm.manage.onReason("Moving to the city")
        vm.manage.savePlacement()
        assertEquals("b2", (admin.changes.single() as EnrollmentChange.Transfer).toBranchId)
        assertEquals(ManageNotice.TRANSFER_REQUESTED, vm.uiState.value.notice)
    }

    @Test
    fun linking_an_existing_guardian_needs_choice_and_relation() {
        val vm = viewModel("students.edit")
        vm.manage.openAddGuardian()
        vm.manage.saveLink()
        val errors = (vm.uiState.value.sheet as ManageSheet.AddGuardian).errors.problems
        assertTrue(ManageController.GUARDIAN in errors && ManageController.RELATION in errors)
        vm.manage.setExistingMode(false)
        vm.manage.onNewGuardian(com.schoolapp.core.ui.people.GuardianForm(name = "Uncle Test", relation = "GUARDIAN", phone = "03111234567"))
        vm.manage.saveLink()
        assertEquals("Uncle Test", admin.links.single().guardian?.name)
        assertEquals(ManageNotice.GUARDIAN_LINKED, vm.uiState.value.notice)
    }
}
