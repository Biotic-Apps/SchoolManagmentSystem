package com.schoolapp.feature.settings.school

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.width
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.loadErrorMessage
import com.schoolapp.feature.settings.R
import com.schoolapp.feature.settings.components.ReadOnlyNotice
import com.schoolapp.feature.settings.components.SettingsFormActions

/** Settings › School & branding: identity, brand colour, printed footers, regional info and a live preview. */
@Composable
internal fun SchoolBrandingTab(schoolId: String, canEdit: Boolean, modifier: Modifier = Modifier) {
    val viewModel: SchoolBrandingViewModel = hiltViewModel(key = "school_$schoolId")
    LaunchedEffect(schoolId) { viewModel.bind(schoolId) }
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val settings = state.settings
    when {
        state.isLoading -> LoadingState(modifier)
        settings == null -> ErrorState(
            message = state.error?.let { loadErrorMessage(it) } ?: stringResource(R.string.settings_school_load_failed),
            modifier = modifier,
            onRetry = viewModel::retry,
        )
        else -> RefreshBox(state.isRefreshing, viewModel::refresh, modifier) {
            ScreenColumn {
                item(key = "form") {
                    BoxWithConstraints(Modifier.fillMaxWidth()) {
                        if (maxWidth >= WIDE) {
                            Row(horizontalArrangement = Arrangement.spacedBy(16.dp), verticalAlignment = Alignment.Top) {
                                SchoolFormCard(state, canEdit, viewModel, Modifier.weight(1f))
                                BrandPreviewCard(state.form, settings.displayName, Modifier.width(PREVIEW_WIDTH))
                            }
                        } else {
                            Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
                                SchoolFormCard(state, canEdit, viewModel)
                                BrandPreviewCard(state.form, settings.displayName)
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun SchoolFormCard(state: SchoolBrandingUiState, canEdit: Boolean, viewModel: SchoolBrandingViewModel, modifier: Modifier = Modifier) {
    AppCard(modifier = modifier, verticalSpacing = 20.dp, animateSize = false) {
        if (!canEdit) ReadOnlyNotice()
        state.saveError?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
        if (state.saved && !state.dirty) InlineMessage(stringResource(R.string.settings_school_saved), StatusTone.Success)
        IdentitySection(state, canEdit, onUpload = viewModel::uploadLogo, onEdit = viewModel::edit)
        PrimaryColorSection(state.form.primaryColor, canEdit, state.serverErrors["primaryColor"], onColor = { hex ->
            viewModel.edit { it.copy(primaryColor = hex.trim().uppercase()) }
        })
        FooterSection(state.form, canEdit, state.serverErrors, onEdit = viewModel::edit)
        state.settings?.let { RegionalSection(it) }
        if (canEdit) {
            SettingsFormActions(
                dirty = state.dirty,
                saving = state.saving,
                onSave = viewModel::save,
                onDiscard = viewModel::discard,
                blocked = !state.form.colorPasses || state.uploadingLogo,
            )
        }
    }
}

private val WIDE = 840.dp
private val PREVIEW_WIDTH = 340.dp
