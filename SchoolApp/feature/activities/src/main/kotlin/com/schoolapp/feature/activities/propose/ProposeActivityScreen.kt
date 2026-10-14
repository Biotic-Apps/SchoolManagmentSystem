package com.schoolapp.feature.activities.propose

import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.AppTopBar
import com.schoolapp.core.designsystem.component.BackButton
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.activity.ActivityType
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.activities.R

/** Callbacks of the propose / edit form, grouped to keep the screen signature readable. */
internal class ProposeActions(
    val onType: (ActivityType) -> Unit,
    val onTitle: (String) -> Unit,
    val onDescription: (String) -> Unit,
    val onDate: (String) -> Unit,
    val onStartTime: (String) -> Unit,
    val onEndDate: (String) -> Unit,
    val onEndTime: (String) -> Unit,
    val onVenue: (String) -> Unit,
    val onWholeBranch: (Boolean) -> Unit,
    val onClassToggle: (String) -> Unit,
    val onSectionToggle: (String) -> Unit,
    val onRetrySections: () -> Unit,
    val onConsentRequired: (Boolean) -> Unit,
    val onDeadline: (String) -> Unit,
    val onFee: (String) -> Unit,
    val onMaxParticipants: (String) -> Unit,
    val onSubmit: () -> Unit,
    val onRetryLoad: () -> Unit,
)

@Composable
internal fun ProposeActivityScreen(
    state: ProposeActivityUiState,
    actions: ProposeActions,
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val title = if (state.isEditing) R.string.activities_edit_title else R.string.activities_propose_title
    AppScaffold(
        modifier = modifier,
        topBar = { AppTopBar(title = stringResource(title), navigationIcon = { BackButton(onBack) }) },
    ) { padding ->
        val body = Modifier.padding(padding)
        when {
            state.submitted -> ScreenColumn(body) {
                val done = if (state.isEditing) R.string.activities_edit_saved else R.string.activities_propose_sent
                item(key = "done") { InlineMessage(stringResource(done), StatusTone.Success) }
                item(key = "back") { PrimaryButton(stringResource(R.string.activities_back_to_list), onBack) }
            }
            state.isLoadingActivity -> LoadingState(body)
            state.loadError != null -> ErrorState(appErrorMessage(state.loadError), body, onRetry = actions.onRetryLoad)
            else -> ProposeFormContent(state, actions, body)
        }
    }
}
