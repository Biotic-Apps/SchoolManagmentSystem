package com.schoolapp.feature.students.child

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.ChildCare
import androidx.compose.material.icons.outlined.EditNote
import androidx.compose.material.icons.outlined.PersonAdd
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.rememberExternalActions
import com.schoolapp.feature.students.R
import com.schoolapp.feature.students.profile.studentProfileItems

@Composable
fun ChildProfileScreen(
    state: ChildProfileUiState,
    onRetry: () -> Unit,
    onRequestCorrection: () -> Unit,
    onLinkChild: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val actions = rememberExternalActions()
    when {
        state.hasNoChildren -> EmptyState(
            title = stringResource(R.string.students_no_children_title),
            message = stringResource(R.string.students_no_children_message),
            icon = Icons.Outlined.ChildCare,
            modifier = modifier,
            action = { PrimaryButton(stringResource(R.string.students_link_child), onLinkChild, leadingIcon = Icons.Outlined.PersonAdd) },
        )
        state.detail != null -> ScreenColumn(modifier) {
            studentProfileItems(state.detail, actions)
            item(key = "actions") { ParentActions(onRequestCorrection, onLinkChild) }
        }
        state.isLoading -> LoadingState(modifier)
        state.error != null -> ErrorState(appErrorMessage(state.error), modifier, onRetry = onRetry)
    }
}

@Composable
private fun ParentActions(onRequestCorrection: () -> Unit, onLinkChild: () -> Unit) {
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
        SecondaryButton(
            text = stringResource(R.string.students_request_correction),
            onClick = onRequestCorrection,
            leadingIcon = Icons.Outlined.EditNote,
            modifier = Modifier.weight(1f),
        )
        SecondaryButton(
            text = stringResource(R.string.students_link_child),
            onClick = onLinkChild,
            leadingIcon = Icons.Outlined.PersonAdd,
            modifier = Modifier.weight(1f),
        )
    }
}
