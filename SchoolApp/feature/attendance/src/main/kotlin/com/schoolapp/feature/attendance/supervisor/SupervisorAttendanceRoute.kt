package com.schoolapp.feature.attendance.supervisor

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppTabs
import com.schoolapp.feature.attendance.R
import com.schoolapp.feature.attendance.staffmark.StaffMarkRoute
import com.schoolapp.feature.attendance.staffmark.StaffMarkViewModel

/**
 * Supervisors and custom roles: the branch's day (classes). Roles holding `attendance.approve`
 * (principal, super admin, ...) also get a Staff tab to mark staff attendance, as on web.
 */
@Composable
internal fun SupervisorAttendanceRoute(
    roleKey: String,
    onOpen: (Any) -> Unit,
    modifier: Modifier = Modifier,
    todayViewModel: BranchTodayViewModel = hiltViewModel(key = "attendance_$roleKey"),
    staffViewModel: StaffMarkViewModel = hiltViewModel(key = "attendance_staff_$roleKey"),
) {
    val staff by staffViewModel.uiState.collectAsStateWithLifecycle()
    if (!staff.canMark) {
        BranchTodayRoute(onOpen, modifier, todayViewModel)
        return
    }
    var tab by rememberSaveable { mutableIntStateOf(0) }
    Column(modifier.fillMaxSize()) {
        AppTabs(
            titles = listOf(stringResource(R.string.attendance_tab_classes), stringResource(R.string.attendance_tab_staff)),
            selectedIndex = tab,
            onSelect = { tab = it },
        )
        when (tab) {
            0 -> BranchTodayRoute(onOpen, Modifier.weight(1f), todayViewModel)
            else -> StaffMarkRoute(Modifier.weight(1f), staffViewModel)
        }
    }
}
