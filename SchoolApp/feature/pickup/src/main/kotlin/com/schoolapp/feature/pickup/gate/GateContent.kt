package com.schoolapp.feature.pickup.gate

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.DirectionsWalk
import androidx.compose.material.icons.outlined.EventBusy
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.pickup.EarlyLeave
import com.schoolapp.core.model.pickup.EarlyLeaveStatus
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.formatDate
import com.schoolapp.feature.pickup.R
import com.schoolapp.feature.pickup.components.BorderedList
import com.schoolapp.feature.pickup.components.EarlyLeaveActions
import com.schoolapp.feature.pickup.components.EarlyLeaveCard
import com.schoolapp.feature.pickup.components.PersonRow
import com.schoolapp.feature.pickup.components.departureTime
import com.schoolapp.feature.pickup.components.studentSearchItems

@Composable
internal fun GateContent(
    state: GateUiState,
    onRecordDeparture: (studentId: String, studentName: String?, leave: EarlyLeave?) -> Unit,
    onApprove: (String) -> Unit,
    onReject: (String) -> Unit,
    onQueryChange: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    ScreenColumn(modifier) {
        item(key = "today") { SectionHeader(stringResource(R.string.pickup_today, formatDate(state.today).orEmpty())) }
        state.actionError?.let { item(key = "action_error") { InlineMessage(appErrorMessage(it), StatusTone.Error) } }
        item(key = "leaves_header") { SectionHeader(stringResource(R.string.pickup_early_leaves)) }
        if (state.earlyLeaves.isEmpty()) {
            item(key = "leaves_empty") { EmptyState(stringResource(R.string.pickup_early_leaves_empty), icon = Icons.Outlined.EventBusy) }
        }
        items(state.earlyLeaves.size, key = { "leave_" + state.earlyLeaves[it].id }) { index ->
            val leave = state.earlyLeaves[index]
            val departed = departureTime(state.departedAt(leave.studentId))
            val open = departed == null && leave.status in OPEN_STATUSES
            EarlyLeaveCard(
                leave = leave,
                departedTime = departed,
                busy = state.busyLeaveId == leave.id,
                actions = if (!state.canEdit || !open) {
                    EarlyLeaveActions()
                } else {
                    EarlyLeaveActions(
                        onApprove = { onApprove(leave.id) }.takeIf { leave.status == EarlyLeaveStatus.REQUESTED },
                        onReject = { onReject(leave.id) }.takeIf { leave.status == EarlyLeaveStatus.REQUESTED },
                        onRecordDeparture = { onRecordDeparture(leave.studentId, leave.studentName, leave) },
                    )
                },
            )
        }
        item(key = "departures_header") { SectionHeader(stringResource(R.string.pickup_departures_today)) }
        if (state.departures.isEmpty()) {
            item(key = "departures_empty") {
                EmptyState(stringResource(R.string.pickup_departures_empty), icon = Icons.AutoMirrored.Outlined.DirectionsWalk)
            }
        } else {
            item(key = "departures") {
                BorderedList(state.departures) { departure ->
                    val supporting = listOfNotNull(
                        departureTime(departure.at),
                        departure.pickedUpByName?.let { stringResource(R.string.pickup_departure_picked_by, it) },
                    ).joinToString(" · ")
                    PersonRow(name = departure.studentName.orEmpty(), supporting = supporting, photoUrl = null)
                }
            }
        }
        if (state.canEdit) {
            item(key = "other_header") { SectionHeader(stringResource(R.string.pickup_record_other)) }
            studentSearchItems(
                state = state.search,
                onQueryChange = onQueryChange,
                onPick = { onRecordDeparture(it.id, it.name, null) },
                hint = null,
            )
        }
    }
}

private val OPEN_STATUSES = setOf(EarlyLeaveStatus.REQUESTED, EarlyLeaveStatus.APPROVED)
