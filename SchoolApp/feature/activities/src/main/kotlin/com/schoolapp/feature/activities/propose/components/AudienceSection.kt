package com.schoolapp.feature.activities.propose.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.FilterChipRow
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.activities.R
import com.schoolapp.feature.activities.propose.ProposeActions
import com.schoolapp.feature.activities.propose.ProposeActivityUiState
import com.schoolapp.feature.activities.propose.ProposeField

/** Whole branch, or any mix of the branch's classes and sections (as the web audience picker). */
@Composable
internal fun AudienceSection(state: ProposeActivityUiState, actions: ProposeActions, enabled: Boolean) {
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        SectionHeader(stringResource(R.string.activities_audience))
        FilterChipRow(
            options = listOf(
                SwitcherOption(WHOLE_BRANCH, stringResource(R.string.activities_audience_whole_branch)),
                SwitcherOption(PICK, stringResource(R.string.activities_audience_pick)),
            ),
            selectedId = if (state.form.wholeBranch) WHOLE_BRANCH else PICK,
            onSelect = { if (enabled) actions.onWholeBranch(it == WHOLE_BRANCH) },
        )
        if (!state.form.wholeBranch) {
            when {
                state.sectionsLoading -> LoadingState()
                state.sectionsError != null -> {
                    InlineMessage(appErrorMessage(state.sectionsError), StatusTone.Error)
                    SecondaryButton(stringResource(R.string.activities_retry), actions.onRetrySections)
                }
                else -> {
                    Group(stringResource(R.string.activities_audience_classes), state.classes, state.form.classIds, actions.onClassToggle, enabled)
                    Group(stringResource(R.string.activities_audience_sections_label), state.sections, state.form.sectionIds, actions.onSectionToggle, enabled)
                }
            }
            if (ProposeField.SECTIONS in state.errors) InlineMessage(stringResource(R.string.activities_error_sections), StatusTone.Error)
        }
    }
}

@Composable
private fun Group(title: String, options: List<SwitcherOption>, selected: Set<String>, onToggle: (String) -> Unit, enabled: Boolean) {
    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
        Text(title, style = MaterialTheme.typography.labelLarge, color = AppColors.TextPrimary)
        if (options.isEmpty()) {
            Text(stringResource(R.string.activities_no_options), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
        } else {
            MultiSelectChips(options, selected, onToggle, enabled = enabled)
        }
    }
}

private const val WHOLE_BRANCH = "whole"
private const val PICK = "pick"
