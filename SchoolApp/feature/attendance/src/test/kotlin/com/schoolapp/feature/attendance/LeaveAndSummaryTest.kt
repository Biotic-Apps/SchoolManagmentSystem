package com.schoolapp.feature.attendance

import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.attendance.RegisterStatus
import com.schoolapp.core.model.attendance.SectionAttendance
import com.schoolapp.core.model.attendance.UnmarkedSection
import com.schoolapp.core.model.attendance.LoadedRegister
import com.schoolapp.core.model.leave.LeaveInput
import com.schoolapp.core.testing.FakeAuthRepository
import com.schoolapp.core.testing.MainDispatcherRule
import com.schoolapp.core.testing.TestSessions
import com.schoolapp.feature.attendance.leave.LeaveForm
import com.schoolapp.feature.attendance.leave.LeaveFormValidator
import com.schoolapp.feature.attendance.leave.LeaveMessage
import com.schoolapp.feature.attendance.leave.MyLeavesController
import com.schoolapp.feature.attendance.supervisor.BranchTodayViewModel
import kotlinx.coroutines.test.TestScope
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import java.time.LocalDateTime

class LeaveAndSummaryTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    @Test
    fun leave_form_requires_dates_in_order_and_a_reason() {
        val invalid = LeaveFormValidator.validate(LeaveForm(from = "2026-10-08", to = "2026-10-07", reason = " "))
        assertTrue(invalid.rangeInvalid)
        assertTrue(invalid.reasonMissing)
        assertTrue(invalid.hasErrors)

        val missing = LeaveFormValidator.validate(LeaveForm(from = "", to = "", reason = "Fever"))
        assertTrue(missing.fromMissing && missing.toMissing)
        assertFalse(missing.rangeInvalid)

        assertFalse(LeaveFormValidator.validate(LeaveForm(from = "2026-10-07", to = "2026-10-07", reason = "Fever")).hasErrors)
    }

    @Test
    fun parent_leave_request_is_validated_before_sending() {
        val leaves = FakeLeaveRepository()
        val controller = MyLeavesController(
            repository = leaves,
            scope = TestScope(mainDispatcherRule.dispatcher),
            withType = false,
            defaultDate = { "2026-10-06" },
            inputFor = { LeaveInput.ForStudent("c1", it.from, it.to, it.reason.trim()) },
        )
        controller.openForm()
        controller.onFromChange("2026-10-09")
        assertEquals("2026-10-09", controller.state.value.form?.to)
        controller.onToChange("2026-10-08")
        controller.submit()
        val form = controller.state.value.form!!
        assertTrue(form.rangeInvalid)
        assertTrue(form.reasonMissing)
        assertTrue(leaves.requests.isEmpty())

        controller.onToChange("2026-10-10")
        controller.onReasonChange(" Family wedding ")
        controller.submit()
        assertEquals(LeaveInput.ForStudent("c1", "2026-10-09", "2026-10-10", "Family wedding"), leaves.requests.single())
        assertNull(controller.state.value.form)
        assertEquals(LeaveMessage.SENT, controller.state.value.message)
        assertEquals(1, controller.state.value.items.size)
    }

    @Test
    fun supervisor_summary_lists_unmarked_sections_first() {
        val repository = FakeAttendanceRepository(LoadedRegister(register(entries = emptyList())))
        repository.summary = listOf(
            SectionAttendance("a", "Class 1", "A", RegisterStatus.SUBMITTED, 20, 2, 1, 1, 25),
            SectionAttendance("b", "Class 2", "B", RegisterStatus.DRAFT, 10, 0, 0, 0, 22),
            SectionAttendance("c", "Class 3", "C", RegisterStatus.SUBMITTED, 18, 0, 0, 0, 18),
        )
        repository.unmarkedSections = listOf(UnmarkedSection("b", "Class 2", "B"), UnmarkedSection("d", "Class 4", "D"))
        val vm = BranchTodayViewModel(
            FakeAuthRepository(TestSessions.session(RoleKey.PRINCIPAL, "attendance.view")),
            repository,
            FakeLeaveRepository(),
            AppClock { LocalDateTime.of(2026, 10, 6, 9, 0) },
        )
        val state = vm.uiState.value
        assertEquals(listOf("b", "d", "a", "c"), state.rows.map { it.sectionId })
        assertEquals(listOf("b", "d"), state.notSubmitted.map { it.sectionId })
        assertEquals(48, state.totals.present)
        assertEquals(13, state.totals.unmarked)
        assertEquals(0, state.pendingLeaves)
    }
}
