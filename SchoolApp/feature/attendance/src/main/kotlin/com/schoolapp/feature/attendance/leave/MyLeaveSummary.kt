package com.schoolapp.feature.attendance.leave

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Cancel
import androidx.compose.material.icons.outlined.EventAvailable
import androidx.compose.material.icons.outlined.HourglassTop
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.FilterChipRow
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.model.leave.LeaveStatus
import com.schoolapp.feature.attendance.R
import com.schoolapp.feature.attendance.components.LeaveStat
import com.schoolapp.feature.attendance.components.LeaveStatTiles
import com.schoolapp.feature.attendance.components.leaveStatusLabel

/** Pending, days approved this year and rejected, as equal-height tiles. */
@Composable
internal fun MyLeaveSummary(summary: LeaveSummary, modifier: Modifier = Modifier) {
    LeaveStatTiles(
        listOf(
            LeaveStat(stringResource(R.string.leave_tile_pending), summary.pending, Icons.Outlined.HourglassTop, StatusTone.Warning),
            LeaveStat(
                stringResource(R.string.leave_tile_approved_days),
                summary.approvedDays,
                Icons.Outlined.EventAvailable,
                StatusTone.Success,
            ),
            LeaveStat(stringResource(R.string.leave_tile_rejected), summary.rejected, Icons.Outlined.Cancel, StatusTone.Error),
        ),
        modifier,
    )
}

/** All / Pending / Approved / Rejected / Cancelled. */
@Composable
internal fun LeaveStatusFilter(selected: LeaveStatus?, onSelect: (LeaveStatus?) -> Unit, modifier: Modifier = Modifier) {
    val options = listOf(SwitcherOption(ALL, stringResource(R.string.leave_filter_all))) +
        LeaveStatus.entries.map { SwitcherOption(it.name, leaveStatusLabel(it)) }
    FilterChipRow(
        options = options,
        selectedId = selected?.name ?: ALL,
        onSelect = { id -> onSelect(LeaveStatus.entries.firstOrNull { it.name == id }) },
        modifier = modifier,
    )
}

private const val ALL = "ALL"
