package com.schoolapp.feature.dashboard

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.fees.InvoicePdfDownloader
import com.schoolapp.core.data.organisation.ScopedSections
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.dashboard.DashboardMetric
import com.schoolapp.core.model.setup.SetupChecklist
import com.schoolapp.core.model.setup.SetupItem
import com.schoolapp.core.model.setup.SetupStep
import com.schoolapp.core.navigation.BellScheduleDestination
import com.schoolapp.core.testing.FakeAuthRepository
import com.schoolapp.core.testing.MainDispatcherRule
import com.schoolapp.core.testing.TestSessions
import com.schoolapp.feature.dashboard.finance.FinanceLoader
import com.schoolapp.feature.dashboard.setup.SetupChecklistLoader
import com.schoolapp.feature.dashboard.setup.toCard
import com.schoolapp.feature.dashboard.supervisor.SupervisorLoader
import com.schoolapp.feature.dashboard.teacher.TeacherDayLoader
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import java.time.LocalDateTime

class SetupChecklistCardTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val clock = AppClock { LocalDateTime.of(2026, 10, 7, 9, 0) }
    private val repository = FakeDashboardRepository().apply {
        summaryResult = AppResult.Success(listOf(DashboardMetric("students", 0)))
    }
    private val fees = FakeFinanceFees()
    private val setup = FakeSetupRepository()

    private fun stateFor(role: RoleKey): DashboardUiState.Supervisor {
        val auth = FakeAuthRepository(TestSessions.session(role, "dashboard.view"))
        val periods = TodayPeriodsLoader(FakeTimetableRepository(emptyList()), clock)
        val vm = DashboardViewModel(
            auth, repository, SupervisorLoader(repository, FinanceLoader(fees.repository), SetupChecklistLoader(setup)),
            TeacherDayLoader(repository, periods, ScopedSections(auth, organisationWith(emptyList())), clock),
            FinanceLoader(fees.repository), clock, InvoicePdfDownloader(fees.repository), emptyScopeController(),
        )
        return vm.uiState.value as DashboardUiState.Supervisor
    }

    private fun item(step: SetupStep, count: Long) = SetupItem(step, count > 0, count)

    @Test
    fun partial_checklist_shows_every_item_with_tick_count_and_link() {
        setup.result = AppResult.Success(
            SetupChecklist("b1", complete = false, items = SetupStep.entries.map { item(it, if (it.ordinal < 3) 5 else 0) }),
        )
        val card = stateFor(RoleKey.PRINCIPAL).setup!!
        assertEquals(SetupStep.entries, card.rows.map { it.step })
        assertEquals(listOf(true, true, true, false, false, false, false, false, false), card.rows.map { it.done })
        assertEquals(5L, card.rows.first().count)
        assertEquals(3, card.doneCount)
        assertEquals(DashboardLink.Menu("staff"), card.rows.first { it.step == SetupStep.TEACHERS }.link)
        assertEquals(DashboardLink.Menu("classes"), card.rows.first { it.step == SetupStep.SUBJECTS }.link)
        assertEquals(listOf<String?>("b1"), setup.calls)
        assertEquals(DashboardLink.Menu("classes"), card.rows.first { it.step == SetupStep.ALLOCATION }.link)
        assertTrue(card.rows.first { it.step == SetupStep.ALLOCATION }.remaining)
        assertEquals(DashboardLink.Screen(BellScheduleDestination()), card.rows.first { it.step == SetupStep.BELL_SCHEDULE }.link)
    }

    @Test
    fun fee_plan_is_status_only_with_a_hint_unless_the_role_can_add_fees() {
        setup.result = AppResult.Success(
            SetupChecklist("b1", complete = false, items = listOf(item(SetupStep.CLASSES, 2), item(SetupStep.FEE_PLAN, 0))),
        )
        val principal = stateFor(RoleKey.PRINCIPAL).setup!!.rows.last()
        assertNull(principal.link)
        assertEquals(R.string.dashboard_setup_fee_plan_hint, principal.hintRes)

        val withFees = SetupChecklist("b1", false, listOf(item(SetupStep.FEE_PLAN, 0))).toCard(canSetUpFees = true)!!.rows.single()
        assertEquals(DashboardLink.Menu("fees"), withFees.link)
        assertNull(withFees.hintRes)
    }

    @Test
    fun complete_checklist_hides_the_card() {
        setup.result = AppResult.Success(SetupChecklist("b1", complete = true, items = SetupStep.entries.map { item(it, 1) }))
        assertNull(stateFor(RoleKey.PRINCIPAL).setup)
    }

    @Test
    fun failed_load_hides_the_card_and_keeps_the_dashboard() {
        setup.result = AppResult.Failure(AppError.Server(500, null, null, null))
        val state = stateFor(RoleKey.PRINCIPAL)
        assertNull(state.setup)
        assertNull(state.summaryError)
        assertEquals(listOf("students"), state.metrics.map { it.key })
    }

    @Test
    fun only_the_principal_asks_for_the_checklist() {
        setup.result = AppResult.Success(SetupChecklist("b1", complete = false, items = listOf(item(SetupStep.TEACHERS, 0))))
        assertNull(stateFor(RoleKey.COORDINATOR).setup)
        assertTrue(setup.calls.isEmpty())
        assertNotNull(stateFor(RoleKey.PRINCIPAL).setup)
    }
}
