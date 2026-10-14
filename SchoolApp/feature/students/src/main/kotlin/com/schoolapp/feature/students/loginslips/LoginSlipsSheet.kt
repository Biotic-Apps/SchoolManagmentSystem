package com.schoolapp.feature.students.loginslips

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Download
import androidx.compose.material.icons.outlined.Share
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.CreatablePickerField
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.PickerOption
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.ui.actionErrorMessage
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.rememberExternalActions
import com.schoolapp.feature.students.R
import com.schoolapp.feature.students.list.classOptions
import com.schoolapp.feature.students.list.shareLink

/** Bulk parent login slips: one slip per student for the primary guardian, three per A4 page. */
@Composable
fun LoginSlipsSheet(onDismiss: () -> Unit, sectionId: String? = null, viewModel: LoginSlipsViewModel = hiltViewModel()) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    LaunchedEffect(sectionId) { viewModel.start(sectionId) }
    val external = rememberExternalActions()
    val context = LocalContext.current
    AppBottomSheet(stringResource(R.string.students_login_slips), onDismiss) {
        Text(stringResource(R.string.students_login_slips_hint), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
        when {
            state.isLoading -> LoadingState()
            state.loadError != null -> ErrorState(appErrorMessage(state.loadError!!), onRetry = { viewModel.start(sectionId) })
            else -> {
                CreatablePickerField(
                    label = stringResource(R.string.students_print_for),
                    options = targetOptions(state),
                    selectedId = state.target,
                    onSelect = { it?.let(viewModel::onTarget) },
                    enabled = !state.working,
                )
                state.review?.let { LoginSlipReviewCard(it) }
                state.error?.let { InlineMessage(actionErrorMessage(it.error, it.details), StatusTone.Error) }
                state.fileUrl?.let { url ->
                    InlineMessage(stringResource(R.string.students_slips_ready), StatusTone.Success)
                    PrimaryButton(stringResource(R.string.students_open_pdf), { external.open(url) }, Modifier.fillMaxWidth(), leadingIcon = Icons.Outlined.Download)
                    SecondaryButton(
                        stringResource(R.string.students_share), { shareLink(context, url, context.getString(R.string.students_login_slips)) },
                        Modifier.fillMaxWidth(), leadingIcon = Icons.Outlined.Share,
                    )
                }
                if (state.working && state.review != null) InlineMessage(stringResource(R.string.students_slips_preparing), StatusTone.Info)
                val review = state.review
                val label = when {
                    review == null -> R.string.students_review
                    review.changes > 0 -> R.string.students_set_passwords_print
                    else -> R.string.students_print_slips
                }
                if (state.fileUrl == null || review != null) {
                    PrimaryButton(
                        stringResource(label), viewModel::submit, Modifier.fillMaxWidth(),
                        loading = state.working, enabled = review == null || review.slips > 0,
                    )
                }
            }
        }
    }
}

@Composable
private fun targetOptions(state: LoginSlipsUiState): List<PickerOption> = buildList {
    add(PickerOption(LoginSlipsUiState.ALL, stringResource(R.string.students_whole_branch)))
    state.sections.classOptions().forEach { (id, name) ->
        add(PickerOption(LoginSlipsViewModel.CLASS + id, stringResource(R.string.students_whole_class, name)))
    }
    state.sections.forEach { add(PickerOption(LoginSlipsViewModel.SECTION + it.id, it.label)) }
}
