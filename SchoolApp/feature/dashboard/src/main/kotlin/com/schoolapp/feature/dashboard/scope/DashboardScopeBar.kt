package com.schoolapp.feature.dashboard.scope

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.widthIn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Apartment
import androidx.compose.material.icons.outlined.CalendarMonth
import androidx.compose.material.icons.outlined.School
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.feature.dashboard.R

/** Web DashboardScopeBar: School › Branch › Session pickers plus "Show everything"; hidden when there is nothing to choose. */
@OptIn(ExperimentalLayoutApi::class)
@Composable
internal fun DashboardScopeBar(
    state: DashboardScopeState,
    onSchool: (String?) -> Unit,
    onBranch: (String?) -> Unit,
    onSession: (String?) -> Unit,
    onReset: () -> Unit,
    modifier: Modifier = Modifier,
) {
    if (!state.showPicker) return
    Column(modifier.fillMaxWidth()) {
        FlowRow(
            Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            val field = Modifier.weight(1f).widthIn(min = 150.dp)
            if (!state.hideSchool) {
                ScopeLevelField(
                    label = stringResource(R.string.dashboard_scope_school),
                    allLabel = stringResource(R.string.dashboard_scope_all_schools),
                    options = state.schools,
                    selectedId = state.scope.schoolId,
                    icon = Icons.Outlined.School,
                    onSelect = onSchool,
                    modifier = field,
                )
            }
            ScopeLevelField(
                label = stringResource(R.string.dashboard_scope_branch),
                allLabel = stringResource(R.string.dashboard_scope_all_branches),
                options = state.branches,
                selectedId = state.scope.branchId,
                icon = Icons.Outlined.Apartment,
                onSelect = onBranch,
                modifier = field,
            )
            if (state.scope.branchId != null && state.sessions.isNotEmpty()) {
                ScopeLevelField(
                    label = stringResource(R.string.dashboard_scope_session),
                    allLabel = stringResource(R.string.dashboard_scope_all_sessions),
                    options = state.sessions,
                    selectedId = state.scope.sessionId,
                    icon = Icons.Outlined.CalendarMonth,
                    onSelect = onSession,
                    modifier = field,
                )
            }
        }
        if (state.scope.isFiltered) AppTextButton(stringResource(R.string.dashboard_scope_reset), onReset)
    }
}
