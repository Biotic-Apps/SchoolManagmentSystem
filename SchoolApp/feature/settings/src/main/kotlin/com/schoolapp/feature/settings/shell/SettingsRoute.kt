package com.schoolapp.feature.settings.shell

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.School
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppTabs
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.ui.loadErrorMessage
import com.schoolapp.feature.settings.R
import com.schoolapp.feature.settings.components.OptionPickerField

/** Settings & Backups: optional school picker, role-dependent tabs and the selected tab's content. */
@Composable
internal fun SettingsRoute(modifier: Modifier = Modifier, viewModel: SettingsShellViewModel = hiltViewModel()) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val schoolId = state.schoolId
    when {
        state.isLoading -> LoadingState(modifier)
        state.error != null -> ErrorState(loadErrorMessage(state.error!!), modifier, onRetry = viewModel::retry)
        schoolId == null -> EmptyState(
            title = stringResource(R.string.settings_no_school),
            message = stringResource(R.string.settings_no_school_message),
            icon = Icons.Outlined.School,
            modifier = modifier,
        )
        else -> Column(modifier.fillMaxSize()) {
            if (state.showSchoolPicker) {
                Box(Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp), contentAlignment = Alignment.TopCenter) {
                    OptionPickerField(
                        label = stringResource(R.string.settings_school),
                        options = state.schools.map { SwitcherOption(it.id, it.name) },
                        selectedId = schoolId,
                        onSelect = viewModel::selectSchool,
                        icon = Icons.Outlined.School,
                        modifier = Modifier.widthIn(max = 560.dp),
                    )
                }
            }
            AppTabs(
                titles = state.tabs.map { stringResource(it.title) },
                selectedIndex = state.tabIndex,
                onSelect = viewModel::selectTab,
            )
            Box(Modifier.weight(1f).fillMaxWidth()) {
                SettingsTabContent(state.tab, schoolId, state.canEdit, state.isSuperAdmin)
            }
        }
    }
}
