package com.schoolapp.feature.payroll

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.testing.MainDispatcherRule
import com.schoolapp.feature.payroll.salary.MySalaryViewModel
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import java.time.LocalDateTime
import java.time.YearMonth

class MySalaryViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val clock = AppClock { LocalDateTime.of(2026, 10, 6, 9, 0) }
    private val repository = FakePayrollRepository()

    @Test
    fun loads_current_month_and_is_always_secure() {
        repository.payslips["2026-10"] = payslip("2026-10")
        val vm = MySalaryViewModel(repository, clock)
        val state = vm.uiState.value
        assertTrue(state.secure)
        assertEquals(YearMonth.of(2026, 10), state.month)
        assertEquals("2026-10", state.payslip?.month)
        assertEquals(3, state.payslip?.earnings?.size)
        assertEquals(27, state.payslip?.attendance?.payDays)
        assertEquals(180, state.payslip?.overtimeMinutes)
        assertEquals(listOf("2026-10"), repository.payslipCalls)
    }

    @Test
    fun never_moves_into_a_future_month() {
        val vm = MySalaryViewModel(repository, clock)
        assertFalse(vm.uiState.value.canGoNext)
        vm.onNextMonth()
        assertEquals(YearMonth.of(2026, 10), vm.uiState.value.month)

        vm.onPreviousMonth()
        assertEquals(YearMonth.of(2026, 9), vm.uiState.value.month)
        assertTrue(vm.uiState.value.canGoNext)
        vm.onNextMonth()
        vm.onNextMonth()
        assertEquals(YearMonth.of(2026, 10), vm.uiState.value.month)
        assertEquals(listOf("2026-10", "2026-09", "2026-10"), repository.payslipCalls)
    }

    @Test
    fun missing_payslip_is_empty_and_failure_is_error_but_still_secure() {
        val vm = MySalaryViewModel(repository, clock)
        assertTrue(vm.uiState.value.isEmpty)
        assertNull(vm.uiState.value.payslip)

        repository.payslipError = AppError.Network
        vm.retry()
        assertEquals(AppError.Network, vm.uiState.value.error)
        assertFalse(vm.uiState.value.isEmpty)
        assertTrue(vm.uiState.value.secure)
    }
}
