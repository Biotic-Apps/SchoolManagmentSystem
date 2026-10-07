package com.schoolapp.feature.health

import androidx.lifecycle.SavedStateHandle
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.model.health.IncidentSeverity
import com.schoolapp.core.testing.MainDispatcherRule
import com.schoolapp.feature.health.report.IncidentField
import com.schoolapp.feature.health.report.ReportIncidentViewModel
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import java.time.LocalDateTime
import java.time.ZoneId

class ReportIncidentViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val health = FakeHealthRepository()
    private val clock = AppClock { LocalDateTime.of(2026, 10, 6, 11, 30) }

    private fun viewModel(studentId: String? = "s1") =
        ReportIncidentViewModel(SavedStateHandle(mapOf("studentId" to studentId)), health, FakeStudentsRepository(), clock, FakeHealthFilesRepository())

    @Test
    fun description_and_action_taken_are_required() {
        val vm = viewModel()
        assertEquals("2026-10-06", vm.uiState.value.date)
        assertEquals("11:30", vm.uiState.value.time)
        vm.submit()
        assertEquals(setOf(IncidentField.DESCRIPTION, IncidentField.ACTION_TAKEN), vm.uiState.value.errors)
        assertTrue(health.reported.isEmpty())
    }

    @Test
    fun future_time_is_rejected() {
        val vm = viewModel()
        vm.onDescriptionChange("Fell in the playground")
        vm.onActionTakenChange("Cleaned and bandaged")
        vm.onTimeChange("12:15")
        vm.submit()
        assertEquals(setOf(IncidentField.FUTURE_TIME), vm.uiState.value.errors)
        assertTrue(health.reported.isEmpty())
    }

    @Test
    fun student_is_required_when_not_prefilled() {
        val vm = viewModel(studentId = null)
        vm.onDescriptionChange("Fever")
        vm.onActionTakenChange("Called parent")
        vm.submit()
        assertEquals(setOf(IncidentField.STUDENT), vm.uiState.value.errors)
    }

    @Test
    fun valid_report_sends_utc_instant_and_shows_success() {
        val vm = viewModel()
        assertEquals("Student s1", vm.uiState.value.studentName)
        vm.onTimeChange("10:05")
        vm.onSeverityChange(IncidentSeverity.SERIOUS)
        vm.onDescriptionChange("  Fell in the playground ")
        vm.onActionTakenChange("Ice pack")
        vm.submit()
        val input = health.reported.single()
        val expected = LocalDateTime.of(2026, 10, 6, 10, 5).atZone(ZoneId.systemDefault()).toInstant().toString()
        assertEquals(expected, input.occurredAt)
        assertEquals("Fell in the playground", input.description)
        assertEquals(IncidentSeverity.SERIOUS, input.severity)
        assertNotNull(vm.uiState.value.submitted)
    }
}
