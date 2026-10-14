package com.schoolapp.feature.attendance.leave

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.EventBusy
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppFloatingButton
import com.schoolapp.core.designsystem.component.ContentMaxWidth
import com.schoolapp.core.designsystem.component.SegmentedChoice
import com.schoolapp.feature.attendance.R

/**
 * Self-service shell shared by staff and parents: an "Attendance | Leave" switch, the chosen content,
 * the "Request leave" button, the full-screen request form and the cancel confirmation.
 * [childName] is set for a parent (the request is for that child).
 */
@Composable
internal fun AttendanceLeaveHost(
    leaves: MyLeavesState,
    controller: MyLeavesController,
    childName: String?,
    canRequest: Boolean,
    onRetry: () -> Unit,
    modifier: Modifier = Modifier,
    attendance: @Composable (Modifier) -> Unit,
) {
    var tab by rememberSaveable { mutableIntStateOf(TAB_ATTENDANCE) }
    LaunchedEffect(leaves.message) { if (leaves.message == LeaveMessage.SENT) tab = TAB_LEAVE }
    val pending = leaves.summary.pending
    Box(modifier.fillMaxSize()) {
        Column(Modifier.fillMaxSize()) {
            Box(Modifier.fillMaxWidth().padding(start = 16.dp, top = 12.dp, end = 16.dp), contentAlignment = Alignment.TopCenter) {
                SegmentedChoice(
                    labels = listOf(
                        stringResource(R.string.attendance_segment_attendance),
                        if (pending > 0) {
                            stringResource(R.string.attendance_tab_pending_leave, pending)
                        } else {
                            stringResource(R.string.attendance_segment_leave)
                        },
                    ),
                    selectedIndex = tab,
                    onSelect = { tab = it },
                    modifier = Modifier.widthIn(max = ContentMaxWidth),
                )
            }
            if (tab == TAB_ATTENDANCE) {
                attendance(Modifier.weight(1f))
            } else {
                MyLeavesPanel(
                    state = leaves,
                    isChild = childName != null,
                    onFilter = controller::onFilter,
                    onAskCancel = controller::askCancel,
                    onRetry = onRetry,
                    onRefresh = controller::pullRefresh,
                    modifier = Modifier.weight(1f),
                )
            }
        }
        if (canRequest) {
            AppFloatingButton(
                text = stringResource(R.string.attendance_request_leave),
                icon = Icons.Outlined.EventBusy,
                onClick = controller::openForm,
                modifier = Modifier.align(Alignment.BottomEnd).padding(16.dp),
            )
        }
    }
    val callbacks = remember(controller) { controller.formCallbacks() }
    leaves.form?.let { form ->
        LeaveRequestScreen(form = form, childName = childName, today = controller.today, callbacks = callbacks)
    }
    leaves.confirmCancel?.let { leave ->
        LeaveCancelDialog(leave, onConfirm = controller::confirmCancel, onDismiss = controller::dismissCancel)
    }
}

private const val TAB_ATTENDANCE = 0
private const val TAB_LEAVE = 1
