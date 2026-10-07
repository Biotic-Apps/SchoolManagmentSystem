package com.schoolapp.feature.dashboard

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.organisation.ScopedSections
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.ChildSummary
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.attendance.AttendanceStatus
import com.schoolapp.core.model.attendance.RegisterStatus
import com.schoolapp.core.model.dashboard.ChildToday
import com.schoolapp.core.model.dashboard.DashboardMetric
import com.schoolapp.core.model.dashboard.PendingDiarySlot
import com.schoolapp.core.model.dashboard.SectionRegisterState
import com.schoolapp.core.model.dashboard.TeacherToday
import com.schoolapp.core.model.notice.Notice
import com.schoolapp.core.model.notice.NoticeStatus
import com.schoolapp.core.model.organisation.Section
import com.schoolapp.core.model.timetable.TeacherSlot
import com.schoolapp.core.navigation.AttendanceRegisterDestination
import com.schoolapp.core.navigation.DiaryEditorDestination
import com.schoolapp.core.testing.FakeAuthRepository
import com.schoolapp.core.testing.MainDispatcherRule
import com.schoolapp.core.testing.TestSessions
import com.schoolapp.feature.dashboard.finance.FinanceLoader
import com.schoolapp.feature.dashboard.parent.attendanceChip
import com.schoolapp.feature.dashboard.setup.SetupChecklistLoader
import com.schoolapp.feature.dashboard.supervisor.SupervisorLoader
import com.schoolapp.feature.dashboard.teacher.TeacherDayLoader
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import java.time.LocalDateTime

class DashboardViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    // Tuesday 6 Oct 2026, 8:45 AM.
    private val clock = AppClock { LocalDateTime.of(2026, 10, 6, 8, 45) }
    private val today = "2026-10-06"
    private val repository = FakeDashboardRepository()
    private val fees = FakeFinanceFees()
    private val setup = FakeSetupRepository()

    private fun viewModel(
        auth: FakeAuthRepository,
        week: List<TeacherSlot> = emptyList(),
        sections: List<Section> = emptyList(),
    ): DashboardViewModel {
        val periods = TodayPeriodsLoader(FakeTimetableRepository(week), clock)
        val scoped = ScopedSections(auth, organisationWith(sections))
        return DashboardViewModel(
            auth, repository, SupervisorLoader(repository, FinanceLoader(fees.repository), SetupChecklistLoader(setup)),
            TeacherDayLoader(repository, periods, scoped, clock), FinanceLoader(fees.repository), clock,
        )
    }

    private fun slot(index: Int, start: String, end: String, day: Int = 2) =
        TeacherSlot(today, day, index, start, end, "A", "Class 5", "Mathematics", null, null, false)

    // Principal / coordinator

    @Test
    fun principal_sees_today_tiles_above_the_summary() {
        repository.pendingResult = AppResult.Success(
            listOf(DashboardMetric("staffAbsentToday", 1), DashboardMetric("unmarkedAttendance", 3), DashboardMetric("pendingLeave", 0)),
        )
        repository.summaryResult = AppResult.Success(listOf(DashboardMetric("students", 420)))
        val vm = viewModel(FakeAuthRepository(TestSessions.session(RoleKey.PRINCIPAL, "dashboard.view")))
        val state = vm.uiState.value as DashboardUiState.Supervisor
        assertTrue(state.showsToday)
        assertEquals(listOf<Pair<String?, String>>("b1" to today), repository.pendingCalls)
        assertEquals(listOf("unmarkedAttendance", "pendingLeave", "staffAbsentToday"), state.tiles.map { it.key })
        assertEquals(listOf(StatusTone.Error, StatusTone.Neutral, StatusTone.Warning), state.tiles.map { it.tone })
        assertEquals(listOf("students"), state.metrics.map { it.key })
    }

    @Test
    fun pending_failure_still_shows_the_summary_with_an_inline_error() {
        repository.pendingResult = AppResult.Failure(AppError.Network)
        repository.summaryResult = AppResult.Success(listOf(DashboardMetric("students", 420)))
        val vm = viewModel(FakeAuthRepository(TestSessions.session(RoleKey.PRINCIPAL, "dashboard.view")))
        val state = vm.uiState.value as DashboardUiState.Supervisor
        assertEquals(AppError.Network, state.pendingError)
        assertNull(state.summaryError)
        assertEquals(1, state.metrics.size)
    }

    @Test
    fun summary_failure_still_shows_the_today_tiles_and_refresh_reloads_both() {
        repository.pendingResult = AppResult.Success(listOf(DashboardMetric("openComplaints", 2)))
        repository.summaryResult = AppResult.Failure(AppError.Network)
        val vm = viewModel(FakeAuthRepository(TestSessions.session(RoleKey.COORDINATOR, "dashboard.view")))
        val state = vm.uiState.value as DashboardUiState.Supervisor
        assertEquals(AppError.Network, state.summaryError)
        assertEquals(1, state.tiles.size)

        vm.refresh()
        assertEquals(2, repository.pendingCalls.size)
        assertEquals(2, repository.summaryCalls)
    }

    @Test
    fun super_admin_keeps_summary_only_and_roles_without_permission_get_welcome() {
        val admin = viewModel(FakeAuthRepository(TestSessions.session(RoleKey.SUPER_ADMIN, "dashboard.view", branchId = null)))
        assertFalse((admin.uiState.value as DashboardUiState.Supervisor).showsToday)
        assertTrue(repository.pendingCalls.isEmpty())

        val headTeacher = viewModel(FakeAuthRepository(TestSessions.session(RoleKey.HEAD_TEACHER)))
        assertTrue(headTeacher.uiState.value is DashboardUiState.Welcome)
    }

    @Test
    fun pending_tile_links_follow_the_role_menus() {
        val tiles = com.schoolapp.feature.dashboard.supervisor.pendingTiles(
            listOf("unmarkedAttendance", "openComplaints", "pendingLeave", "staffAbsentToday", "todayIncidents")
                .map { DashboardMetric(it, 1) },
        ).associateBy { it.key }
        val attendanceOnly: (String) -> Boolean = { it == "attendance" }
        assertEquals(DashboardLink.Menu("attendance"), tiles.getValue("unmarkedAttendance").link)
        assertTrue(tiles.getValue("unmarkedAttendance").link.isOpenable(attendanceOnly))
        assertFalse(tiles.getValue("openComplaints").link.isOpenable(attendanceOnly))
        assertFalse(tiles.getValue("todayIncidents").link.isOpenable(attendanceOnly))
        assertTrue(tiles.getValue("pendingLeave").link is DashboardLink.Screen)
        assertTrue(tiles.getValue("pendingLeave").link.isOpenable(attendanceOnly))
        assertNull(tiles.getValue("staffAbsentToday").link)
        assertFalse(tiles.getValue("staffAbsentToday").link.isOpenable { true })
    }

    // Teacher / helper

    @Test
    fun teacher_today_maps_registers_and_diaries_to_destinations() {
        repository.teacherResult = AppResult.Success(
            TeacherToday(
                periods = listOf(slot(2, "08:40", "09:20"), slot(1, "08:00", "08:40")),
                registers = listOf(
                    SectionRegisterState("s1", "Class 5 - A", RegisterStatus.UNMARKED),
                    SectionRegisterState("s2", null, RegisterStatus.SUBMITTED),
                ),
                diariesPending = listOf(PendingDiarySlot("s1", null, "math", "Mathematics")),
                unreadMessages = 4,
                assignedComplaints = 1,
            ),
        )
        val sections = listOf(
            Section("s1", "c5", "Class 5", "A", null, null, 30, null),
            Section("s2", "c6", "Class 6", "B", null, null, 28, null),
        )
        val vm = viewModel(FakeAuthRepository(TestSessions.session(RoleKey.TEACHER)), sections = sections)
        val day = (vm.uiState.value as DashboardUiState.Teacher).day
        assertEquals(listOf(1, 2), day.periods.map { it.periodIndex })
        assertEquals("8:40 AM – 9:20 AM", day.periods[1].timeRange)
        assertTrue(day.periods[1].isCurrent)
        assertEquals(AttendanceRegisterDestination("s1", today, "Class 5 - A"), day.registers[0].destination)
        assertEquals("Class 6 - B", day.registers[1].label)
        assertEquals(
            DiaryEditorDestination("s1", today, "math", "Class 5 - A · Mathematics"),
            day.diariesPending.single().destination,
        )
        assertEquals(4, day.unreadMessages)
        assertEquals(1, day.assignedComplaints)
        assertNull(day.error)
    }

    @Test
    fun helper_falls_back_to_the_timetable_when_teacher_today_fails() {
        repository.teacherResult = AppResult.Failure(AppError.Network)
        val week = listOf(slot(1, "08:00", "08:40"), slot(1, "08:00", "08:40", day = 3))
        val vm = viewModel(FakeAuthRepository(TestSessions.session(RoleKey.HELPER)), week = week)
        val day = (vm.uiState.value as DashboardUiState.Teacher).day
        assertEquals(1, day.periods.size)
        assertEquals(AppError.Network, day.error)
        assertNull(day.unreadMessages)
    }

    // Parent

    private fun notice(id: String, pinned: Boolean) =
        Notice(id, "Notice $id", "Body", NoticeStatus.PUBLISHED, pinned, null, null, null, null, isRead = false)

    private fun childToday(attendance: AttendanceStatus?, notices: List<Notice> = emptyList()) =
        AppResult.Success(ChildToday(attendance, emptyList(), notices, consentsPending = 2, nextMeeting = null))

    @Test
    fun parent_home_reloads_when_the_active_child_changes() {
        repository.childResults["c1"] = childToday(AttendanceStatus.PRESENT)
        repository.childResults["c2"] = childToday(null)
        val children = listOf(ChildSummary("c1", "Ayesha", "Class 5", "A"), ChildSummary("c2", "Omar", "Class 4", "B"))
        val auth = FakeAuthRepository(TestSessions.session(RoleKey.PARENT).copy(children = children, activeChildId = "c1"))
        val vm = viewModel(auth)
        val first = vm.uiState.value as DashboardUiState.Parent
        assertEquals("c1", first.child?.id)
        assertEquals(AttendanceStatus.PRESENT, first.home?.attendance)

        auth.sessionState.value = auth.sessionState.value!!.copy(activeChildId = "c2")
        val second = vm.uiState.value as DashboardUiState.Parent
        assertEquals(listOf("c1", "c2"), repository.childCalls)
        assertEquals("c2", second.child?.id)
        assertNull(second.home?.attendance)
        assertEquals(2, second.home?.consentsPending)
    }

    @Test
    fun unmarked_attendance_shows_not_marked_never_absent() {
        val chip = attendanceChip(null)
        assertEquals(R.string.dashboard_attendance_not_marked, chip.labelRes)
        assertEquals(StatusTone.Neutral, chip.tone)
        assertEquals(R.string.dashboard_attendance_absent, attendanceChip(AttendanceStatus.ABSENT).labelRes)
    }

    @Test
    fun parent_notices_put_pinned_first_and_keep_three() {
        val notices = listOf(notice("1", false), notice("2", false), notice("3", true), notice("4", false))
        repository.childResults["c1"] = childToday(null, notices)
        val auth = FakeAuthRepository(
            TestSessions.session(RoleKey.PARENT).copy(children = listOf(ChildSummary("c1", "Ayesha")), activeChildId = "c1"),
        )
        val home = (viewModel(auth).uiState.value as DashboardUiState.Parent).home!!
        assertEquals(listOf("3", "1", "2"), home.notices.map { it.id })
    }

    @Test
    fun parent_failure_keeps_the_child_and_reports_the_error() {
        val auth = FakeAuthRepository(
            TestSessions.session(RoleKey.PARENT).copy(children = listOf(ChildSummary("c1", "Ayesha")), activeChildId = "c1"),
        )
        val state = viewModel(auth).uiState.value as DashboardUiState.Parent
        assertEquals("c1", state.child?.id)
        assertNull(state.home)
        assertEquals(AppError.Network, state.error)
    }

    // Finance tiles

    private val overview = com.schoolapp.core.model.fees.FinanceOverview(
        billedMinor = 50_000_000, collectedMinor = 41_000_000, outstandingMinor = 9_000_000, overdueMinor = 3_500_000,
        collectionRate = 82.0, expensesMinor = 6_000_000, payrollMinor = 40_000_000, todayCollectedMinor = 1_250_000,
    )

    @Test
    fun principal_with_fees_view_gets_the_month_finance_card() {
        fees.result = AppResult.Success(overview)
        val vm = viewModel(FakeAuthRepository(TestSessions.session(RoleKey.PRINCIPAL, "dashboard.view", "fees.view")))
        val finance = (vm.uiState.value as DashboardUiState.Supervisor).finance
        assertEquals(listOf<Pair<String?, String?>>("b1" to "2026-10"), fees.calls)
        assertEquals("2026-10", finance?.month)
        assertEquals(41_000_000L, finance?.overview?.collectedMinor)
        assertNull(finance?.error)
    }

    @Test
    fun finance_failure_stays_inside_the_card() {
        fees.result = AppResult.Failure(AppError.Network)
        repository.summaryResult = AppResult.Success(listOf(DashboardMetric("students", 420)))
        val vm = viewModel(FakeAuthRepository(TestSessions.session(RoleKey.PRINCIPAL, "dashboard.view", "fees.view")))
        val state = vm.uiState.value as DashboardUiState.Supervisor
        assertEquals(AppError.Network, state.finance?.error)
        assertNull(state.finance?.overview)
        assertEquals(1, state.metrics.size)
    }

    @Test
    fun finance_card_is_hidden_without_fees_view() {
        val vm = viewModel(FakeAuthRepository(TestSessions.session(RoleKey.PRINCIPAL, "dashboard.view")))
        assertNull((vm.uiState.value as DashboardUiState.Supervisor).finance)
        assertTrue(fees.calls.isEmpty())
    }

    @Test
    fun accountant_gets_welcome_with_finance_and_card_links_to_fees() {
        fees.result = AppResult.Success(overview)
        val vm = viewModel(FakeAuthRepository(TestSessions.session(RoleKey.ACCOUNTANT, "fees.view")))
        val state = vm.uiState.value as DashboardUiState.Welcome
        assertEquals(overview, state.finance?.overview)

        var opened: String? = null
        val action = com.schoolapp.feature.dashboard.components.financeAction({ opened = it }, { it == "fees" })
        action?.invoke()
        assertEquals("fees", opened)
        assertNull(com.schoolapp.feature.dashboard.components.financeAction({}, { false }))
        assertEquals("82%", com.schoolapp.feature.dashboard.finance.collectionRateLabel(82.4))
        assertEquals("October 2026", com.schoolapp.feature.dashboard.finance.financeMonthLabel("2026-10"))
    }
}
