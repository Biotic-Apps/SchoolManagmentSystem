package com.schoolapp.feature.notices.compose

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.FilterChipRow
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.feature.notices.R
import com.schoolapp.feature.notices.components.MultiSelectChips

/** Whole branch / classes / sections, with multi-select chips for the chosen kind. */
@Composable
internal fun AudiencePicker(
    state: NoticeComposeUiState,
    enabled: Boolean,
    onModeChange: (AudienceMode) -> Unit,
    onToggleClass: (String) -> Unit,
    onToggleSection: (String) -> Unit,
) {
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        FilterChipRow(
            options = listOf(
                SwitcherOption(AudienceMode.BRANCH.name, stringResource(R.string.notices_audience_branch)),
                SwitcherOption(AudienceMode.CLASSES.name, stringResource(R.string.notices_audience_classes)),
                SwitcherOption(AudienceMode.SECTIONS.name, stringResource(R.string.notices_audience_sections)),
            ),
            selectedId = state.audience.name,
            onSelect = { if (enabled) onModeChange(AudienceMode.valueOf(it)) },
        )
        if (!state.optionsLoading && state.optionsError == null) {
            when (state.audience) {
                AudienceMode.BRANCH -> Unit
                AudienceMode.CLASSES -> MultiSelectChips(state.classes, state.selectedClassIds, onToggleClass, enabled = enabled)
                AudienceMode.SECTIONS -> MultiSelectChips(state.sections, state.selectedSectionIds, onToggleSection, enabled = enabled)
            }
        }
    }
}
