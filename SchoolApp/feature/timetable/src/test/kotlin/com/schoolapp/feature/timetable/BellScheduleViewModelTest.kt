package com.schoolapp.feature.timetable

import androidx.lifecycle.SavedStateHandle
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.data.academics.AcademicsEvents
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.testing.FakeAuthRepository
import com.schoolapp.core.testing.MainDispatcherRule
import com.schoolapp.core.testing.TestSessions
import com.schoolapp.feature.timetable.bell.BellRow
import com.schoolapp.feature.timetable.bell.BellRules
import com.schoolapp.feature.timetable.bell.BellScheduleViewModel
import com.schoolapp.feature.timetable.bell.RowProblem
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

class BellScheduleViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val repository = FakeBuilderRepository()
    private val principal = FakeAuthRepository(TestSessions.session(RoleKey.PRINCIPAL, "timetable.view", "timetable.edit"))

    private fun viewModel(auth: FakeAuthRepository = principal) =
        BellScheduleViewModel(SavedStateHandle(), FakeBell(), repository, OrgAnswers().repository, auth, AcademicsEvents())

    @Test
    fun generator_matches_the_contract_default() {
        val rows = BellRules.generate("08:00", 40, 8, 4, 30)
        assertEquals(9, rows.size)
        assertEquals(BellRow("10:40", "11:10", isBreak = true, label = "Break"), rows[4])
        assertEquals("13:50", rows.last().endTime)
        assertTrue(BellRules.generate("08:00", 40, 3, 0, 30).none { it.isBreak })
    }

    @Test
    fun row_problems_find_reversed_and_overlapping_times() {
        val problems = BellRules.problems(listOf(BellRow("08:00", "08:40"), BellRow("08:30", "09:10"), BellRow("10:00", "09:50")))
        assertEquals(mapOf(1 to RowProblem.OVERLAPS_PREVIOUS, 2 to RowProblem.END_BEFORE_START), problems)
    }

    @Test
    fun teachers_only_view() {
        val teacher = FakeAuthRepository(TestSessions.session(RoleKey.TEACHER, "timetable.view", "timetable.edit"))
        assertFalse(viewModel(teacher).uiState.value.canEdit)
        assertTrue(viewModel().uiState.value.canEdit)
    }

    @Test
    fun day_variant_starts_as_a_copy_and_is_sent_under_its_weekday() {
        val vm = viewModel()
        assertEquals("Friday already has its own times", listOf(1, 2, 3, 4, 6), vm.uiState.value.variantCandidates)
        vm.addVariant(6)
        assertEquals(6, vm.uiState.value.selectedDay)
        vm.removeRow(0)
        vm.save()
        val input = repository.bellSaves.single()
        assertEquals(setOf(5, 6), input.days.keys)
        assertEquals(input.default.size - 1, input.days.getValue(6).size)
        assertEquals(listOf(1, 2, 3), input.days.getValue(6).map { it.index })
        assertTrue(input.default.filter { !it.isBreak }.all { it.label == null })
        assertEquals("Break", input.default.first { it.isBreak }.label)
    }

    @Test
    fun invalid_rows_block_saving() {
        val vm = viewModel()
        vm.setEnd(0, "07:00")
        vm.save()
        assertEquals(RowProblem.END_BEFORE_START, vm.uiState.value.problems[0])
        assertTrue(repository.bellSaves.isEmpty())
    }

    @Test
    fun periods_in_use_asks_then_saves_with_drop_lessons() {
        val vm = viewModel()
        repository.bellFailures += AppError.Server(409, "PERIODS_IN_USE", "2 lesson(s) are on removed periods", """["Mon P6: 9-A English","Tue P6: 9-A Urdu"]""")
        vm.removeRow(0)
        vm.save()
        assertEquals(listOf("Mon P6: 9-A English", "Tue P6: 9-A Urdu"), vm.uiState.value.lessonsToDrop)
        assertFalse(repository.bellSaves.single().dropLessons)
        vm.save(dropLessons = true)
        assertTrue(repository.bellSaves.last().dropLessons)
        assertNull(vm.uiState.value.lessonsToDrop)
        assertTrue(vm.uiState.value.saved)
        assertFalse(vm.uiState.value.dirty)
    }

    @Test
    fun generate_fills_the_selected_day() {
        val vm = viewModel()
        vm.openGenerator()
        vm.updateGenerator { it.copy(periodsPerDay = "6", breakAfter = "6") }
        vm.applyGenerator()
        assertTrue("break after the last period is invalid", vm.uiState.value.generator!!.invalid)
        vm.updateGenerator { it.copy(breakAfter = "3", breakMinutes = "15") }
        vm.applyGenerator()
        assertNull(vm.uiState.value.generator)
        assertEquals(7, vm.uiState.value.current!!.rows.size)
        assertTrue(vm.uiState.value.dirty)
    }
}
