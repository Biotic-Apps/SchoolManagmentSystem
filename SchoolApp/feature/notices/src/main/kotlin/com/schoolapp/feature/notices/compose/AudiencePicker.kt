package com.schoolapp.feature.notices.compose

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.notice.NoticeAudience
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.notices.R
import com.schoolapp.feature.notices.components.MultiSelectChips
import com.schoolapp.feature.notices.components.SwitchRow
import com.schoolapp.feature.notices.components.audienceSummary

/** Who receives the notice: whole school, or any mix of branches, classes and sections; optionally staff only. */
@Composable
internal fun AudiencePicker(
    state: NoticeComposeUiState,
    enabled: Boolean,
    onChange: ((NoticeAudience) -> NoticeAudience) -> Unit,
    onRetryOptions: () -> Unit,
) {
    val audience = state.audience
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        SectionHeader(title = stringResource(R.string.notices_audience))
        SwitchRow(
            title = stringResource(R.string.notices_whole_school),
            supporting = stringResource(R.string.notices_whole_school_supporting),
            checked = audience.schoolWide,
            onCheckedChange = { checked -> onChange { it.copy(schoolWide = checked) } },
            enabled = enabled,
        )
        SwitchRow(
            title = stringResource(R.string.notices_staff_only),
            supporting = stringResource(R.string.notices_staff_only_supporting),
            checked = audience.staffOnly,
            onCheckedChange = { checked -> onChange { it.copy(staffOnly = checked) } },
            enabled = enabled,
        )
        if (!audience.schoolWide) {
            when {
                state.optionsLoading -> LoadingState()
                state.optionsError != null -> ErrorState(appErrorMessage(state.optionsError), onRetry = onRetryOptions)
                else -> {
                    TargetGroup(R.string.notices_branches, state.options.branches, audience.branchIds, enabled) { id ->
                        onChange { it.copy(branchIds = it.branchIds.toggle(id)) }
                    }
                    TargetGroup(R.string.notices_audience_classes, state.options.classes, audience.classIds, enabled) { id ->
                        onChange { it.copy(classIds = it.classIds.toggle(id)) }
                    }
                    TargetGroup(R.string.notices_audience_sections, state.options.sections, audience.sectionIds, enabled) { id ->
                        onChange { it.copy(sectionIds = it.sectionIds.toggle(id)) }
                    }
                }
            }
        }
        Text(
            stringResource(R.string.notices_sent_to, audienceSummary(audience, state.options::nameOf)),
            style = MaterialTheme.typography.bodyMedium,
            color = AppColors.TextSecondary,
        )
        if (state.audienceMissing) {
            Text(stringResource(R.string.notices_audience_required), style = MaterialTheme.typography.bodySmall, color = AppColors.Error)
        }
    }
}

@Composable
private fun TargetGroup(label: Int, options: List<SwitcherOption>, selected: List<String>, enabled: Boolean, onToggle: (String) -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
        Text(stringResource(label), style = MaterialTheme.typography.labelLarge, color = AppColors.TextPrimary)
        if (options.isEmpty()) {
            Text(stringResource(R.string.notices_no_options), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
        } else {
            MultiSelectChips(options, selected.toSet(), onToggle, enabled = enabled)
        }
    }
}

private fun List<String>.toggle(id: String): List<String> = if (id in this) this - id else this + id
