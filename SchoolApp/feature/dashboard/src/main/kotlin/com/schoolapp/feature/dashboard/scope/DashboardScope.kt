package com.schoolapp.feature.dashboard.scope

import androidx.compose.runtime.Immutable
import com.schoolapp.core.designsystem.component.SwitcherOption

/** School › Branch › Session filter (web `ScopeValue`); null levels mean "all in my scope". */
@Immutable
data class DashboardScope(
    val schoolId: String? = null,
    val branchId: String? = null,
    val sessionId: String? = null,
) {
    val isFiltered: Boolean get() = schoolId != null || branchId != null || sessionId != null
}

/** Picker state, mirroring web `use-dashboard-scope.ts`. */
@Immutable
data class DashboardScopeState(
    val scope: DashboardScope = DashboardScope(),
    val schools: List<SwitcherOption> = emptyList(),
    val branches: List<SwitcherOption> = emptyList(),
    val sessions: List<SwitcherOption> = emptyList(),
) {
    val hideSchool: Boolean get() = schools.size <= 1
    val showPicker: Boolean get() = branches.size > 1 || schools.size > 1 || sessions.isNotEmpty()
}
