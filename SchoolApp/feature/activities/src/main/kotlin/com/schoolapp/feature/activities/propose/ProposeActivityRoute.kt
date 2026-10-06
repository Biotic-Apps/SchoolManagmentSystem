package com.schoolapp.feature.activities.propose

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle

@Composable
internal fun ProposeActivityRoute(
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: ProposeActivityViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val actions = remember(viewModel) {
        ProposeActions(
            onType = viewModel::onTypeChange,
            onTitle = viewModel::onTitleChange,
            onDescription = viewModel::onDescriptionChange,
            onDate = viewModel::onDateChange,
            onStartTime = viewModel::onStartTimeChange,
            onEndTime = viewModel::onEndTimeChange,
            onVenue = viewModel::onVenueChange,
            onWholeBranch = viewModel::onWholeBranchChange,
            onSectionToggle = viewModel::onSectionToggle,
            onRetrySections = viewModel::loadSections,
            onConsentRequired = viewModel::onConsentRequiredChange,
            onDeadline = viewModel::onDeadlineChange,
            onSubmit = viewModel::submit,
        )
    }
    ProposeActivityScreen(state = state, actions = actions, onBack = onBack, modifier = modifier)
}
