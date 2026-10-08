package com.schoolapp.feature.timetable

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.organisation.ScopedSections
import com.schoolapp.core.data.staff.StaffRepository
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.RoleRef
import com.schoolapp.core.model.staff.StaffSummary
import com.schoolapp.core.model.timetable.OverrideInput
import com.schoolapp.core.model.timetable.TimetableOverride
import com.schoolapp.core.testing.FakeAuthRepository
import com.schoolapp.core.testing.MainDispatcherRule
import com.schoolapp.core.testing.TestSessions
import com.schoolapp.feature.timetable.substitutions.SubstitutionNotice
import com.schoolapp.feature.timetable.substitutions.SubstitutionsLoader
import com.schoolapp.feature.timetable.substitutions.SubstitutionsViewModel
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import java.lang.reflect.Proxy

class SubstitutionsViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val timetables = FakeTimetables()
    private val org = OrgAnswers().apply { sections = listOf(section()) }
    private val staff = listOf(
        staffMember("t1", "Hina", listOf("TEACHER")),
        staffMember("t2", "Ali", listOf("COORDINATOR", "TEACHER")),
        staffMember("acc", "Accountant", listOf("ACCOUNTANT")),
        staffMember("old", "Left", listOf("TEACHER"), status = "INACTIVE"),
        staffMember("far", "Other branch", listOf("TEACHER"), branchId = "b2"),
    )

    private fun viewModel(role: RoleRef, vararg permissions: String): SubstitutionsViewModel {
        val auth = FakeAuthRepository(TestSessions.session(role, *permissions))
        val loader = SubstitutionsLoader(timetables, org.repository, ScopedSections(auth, org.repository), FakeBell(), staffRepository())
        // Thursday 8 Oct 2026.
        return SubstitutionsViewModel(auth, loader, timetables, clockAt(4, 9, 0)).also { it.onOpened() }
    }

    private fun editor() = viewModel(RoleKey.PRINCIPAL, "timetable.view", "timetable.edit")

    @Test
    fun principal_sees_the_days_substitutions_with_labels() {
        timetables.overrides = listOf(TimetableOverride("o1", "s1", "2026-10-08", 4, "t1", "Hina", "Omar", "Leave"))
        val state = editor().uiState.value

        assertTrue(state.available)
        assertTrue(state.canEdit)
        assertEquals(listOf("b1" to "2026-10-08"), timetables.overrideQueries)
        val item = state.items.single()
        assertEquals("Class 5 · A", item.classLabel)
        assertEquals(3, item.periodNumber)
        assertEquals("9:40 – 10:20 AM", item.timeRange)
        assertEquals("Hina", item.substitute)
        assertEquals("Omar", item.originalTeacher)
        assertEquals(listOf("Ali", "Hina"), state.teachers.map { it.label })
        assertEquals(listOf("s1"), state.sections.map { it.id })
    }

    @Test
    fun view_only_supervisor_cannot_assign_or_remove() {
        timetables.overrides = listOf(TimetableOverride("o1", "s1", "2026-10-08", 1, "t1", "Hina", null, null))
        val vm = viewModel(RoleKey.COORDINATOR, "timetable.view")
        vm.openForm()
        vm.onRemoveRequested(vm.uiState.value.items.single())

        assertTrue(vm.uiState.value.available)
        assertFalse(vm.uiState.value.canEdit)
        assertNull(vm.uiState.value.form)
        assertNull(vm.uiState.value.removing)
    }

    @Test
    fun teachers_do_not_get_substitutions() {
        val vm = viewModel(RoleKey.TEACHER, "timetable.view", "timetable.edit")
        assertFalse(vm.uiState.value.available)
        assertTrue(timetables.overrideQueries.isEmpty())
    }

    @Test
    fun incomplete_form_shows_errors_then_valid_form_assigns_and_reloads() {
        val vm = editor()
        vm.openForm()
        assertEquals(listOf(1, 2, 4), vm.uiState.value.periods.map { it.index })
        vm.submit()
        assertTrue(vm.uiState.value.form!!.showErrors)
        assertTrue(timetables.assigned.isEmpty())

        vm.onFormSection("s1")
        vm.onFormPeriod(4)
        vm.onFormTeacher("t1")
        vm.onFormReason("  Sick leave ")
        vm.submit()

        assertEquals(listOf(OverrideInput("s1", "2026-10-08", 4, "t1", "Sick leave")), timetables.assigned)
        val state = vm.uiState.value
        assertNull(state.form)
        assertEquals(SubstitutionNotice.ASSIGNED, state.notice)
        assertEquals(listOf("new"), state.items.map { it.id })
    }

    @Test
    fun friday_form_uses_its_own_periods_and_drops_a_missing_one() {
        val vm = editor()
        vm.openForm()
        vm.onFormPeriod(4)
        vm.onFormDate("2026-10-09")

        assertEquals(listOf(1, 2), vm.uiState.value.periods.map { it.index })
        assertNull(vm.uiState.value.form!!.periodIndex)
        assertEquals("2026-10-09", vm.uiState.value.form!!.date)
    }

    @Test
    fun server_rejection_stays_in_the_form() {
        timetables.writeFailure = AppError.Server(409, "CONFLICT", "That period already has a substitute")
        val vm = editor()
        vm.openForm()
        vm.onFormSection("s1")
        vm.onFormPeriod(1)
        vm.onFormTeacher("t2")
        vm.onFormReason("Workshop")
        vm.submit()

        val form = vm.uiState.value.form
        assertNotNull(form)
        assertEquals(timetables.writeFailure, form!!.error)
        assertFalse(form.isSaving)
    }

    @Test
    fun remove_after_confirmation_and_failure_is_reported() {
        timetables.overrides = listOf(
            TimetableOverride("o1", "s1", "2026-10-08", 1, "t1", "Hina", null, null),
            TimetableOverride("o2", "s1", "2026-10-08", 2, "t2", "Ali", null, null),
        )
        val vm = editor()
        vm.onRemoveRequested(vm.uiState.value.items.first())
        vm.confirmRemove()
        assertEquals(listOf("o1"), timetables.removed)
        assertEquals(listOf("o2"), vm.uiState.value.items.map { it.id })
        assertEquals(SubstitutionNotice.REMOVED, vm.uiState.value.notice)

        timetables.writeFailure = AppError.Network
        vm.onRemoveRequested(vm.uiState.value.items.first())
        vm.confirmRemove()
        assertEquals(AppError.Network, vm.uiState.value.actionError)
        assertNull(vm.uiState.value.removing)
        assertEquals(1, vm.uiState.value.items.size)
    }

    @Test
    fun picking_a_date_loads_that_day_and_failure_shows_error() {
        val vm = editor()
        vm.onDateSelected("2026-10-10")
        assertEquals("b1" to "2026-10-10", timetables.overrideQueries.last())

        timetables.failure = AppError.Network
        vm.retry()
        assertEquals(AppError.Network, vm.uiState.value.error)
        assertFalse(vm.uiState.value.isLoading)
    }

    private fun staffRepository(): StaffRepository = Proxy.newProxyInstance(
        StaffRepository::class.java.classLoader, arrayOf(StaffRepository::class.java),
    ) { _, method, _ ->
        when (method.name) {
            "staff" -> AppResult.Success(staff)
            else -> AppResult.Failure(AppError.Network)
        }
    } as StaffRepository

    private fun staffMember(id: String, name: String, roles: List<String>, status: String = "ACTIVE", branchId: String = "b1") =
        StaffSummary(id, name, null, null, null, "Main Branch", status, roles, false, null, 0, 0, branchId = branchId)
}
