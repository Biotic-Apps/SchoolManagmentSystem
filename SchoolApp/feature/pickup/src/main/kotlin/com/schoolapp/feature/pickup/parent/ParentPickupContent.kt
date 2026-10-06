package com.schoolapp.feature.pickup.parent

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.EventBusy
import androidx.compose.material.icons.outlined.FamilyRestroom
import androidx.compose.material.icons.outlined.PersonAdd
import androidx.compose.material.icons.outlined.Schedule
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.pickup.R
import com.schoolapp.feature.pickup.components.BorderedList
import com.schoolapp.feature.pickup.components.EarlyLeaveCard
import com.schoolapp.feature.pickup.components.PersonRow
import com.schoolapp.feature.pickup.components.personStatusLabel
import com.schoolapp.feature.pickup.components.tone

@Composable
internal fun ParentPickupContent(
    state: ParentPickupUiState,
    onRetry: () -> Unit,
    onAddPerson: () -> Unit,
    onRequestEarlyLeave: () -> Unit,
    modifier: Modifier = Modifier,
) {
    when {
        state.isLoading -> LoadingState(modifier)
        state.noChild -> EmptyState(
            title = stringResource(R.string.pickup_no_child),
            message = stringResource(R.string.pickup_no_child_message),
            modifier = modifier,
            icon = Icons.Outlined.FamilyRestroom,
        )
        state.error != null -> ErrorState(appErrorMessage(state.error), modifier, onRetry = onRetry)
        else -> ScreenColumn(modifier) {
            state.message?.let { message ->
                item(key = "message") {
                    val text = when (message) {
                        ParentPickupMessage.PERSON_ADDED -> R.string.pickup_person_added
                        ParentPickupMessage.LEAVE_REQUESTED -> R.string.pickup_leave_sent
                    }
                    InlineMessage(stringResource(text), StatusTone.Success)
                }
            }
            item(key = "persons_header") {
                SectionHeader(
                    title = stringResource(R.string.pickup_persons),
                    subtitle = stringResource(R.string.pickup_persons_subtitle),
                    action = { AppTextButton(stringResource(R.string.pickup_add_person), onAddPerson, leadingIcon = Icons.Outlined.PersonAdd) },
                )
            }
            if (state.persons.isEmpty()) {
                item(key = "persons_empty") { EmptyState(stringResource(R.string.pickup_persons_empty), icon = Icons.Outlined.PersonAdd) }
            } else {
                item(key = "persons") {
                    BorderedList(state.persons) { person ->
                        PersonRow(
                            name = person.name,
                            supporting = listOfNotNull(person.relation, person.phone).joinToString(" · "),
                            photoUrl = person.photoUrl,
                            trailing = { StatusChip(personStatusLabel(person.status), person.status.tone()) },
                        )
                    }
                }
            }
            item(key = "leave_header") {
                SectionHeader(
                    title = stringResource(R.string.pickup_early_leave),
                    action = {
                        AppTextButton(stringResource(R.string.pickup_request_early_leave), onRequestEarlyLeave, leadingIcon = Icons.Outlined.Schedule)
                    },
                )
            }
            if (state.earlyLeaves.isEmpty()) {
                item(key = "leave_empty") { EmptyState(stringResource(R.string.pickup_early_leave_empty), icon = Icons.Outlined.EventBusy) }
            }
            items(state.earlyLeaves.size, key = { "leave_" + state.earlyLeaves[it].id }) { index ->
                EarlyLeaveCard(state.earlyLeaves[index], showStudent = false)
            }
        }
    }
}
