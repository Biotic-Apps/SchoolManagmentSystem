package com.schoolapp.feature.students.detail.idcard

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Print
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.CreatablePickerField
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.PickerOption
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.ui.fileJobMessage
import com.schoolapp.core.ui.loadErrorMessage
import com.schoolapp.core.ui.rememberExternalActions
import com.schoolapp.feature.students.R

/**
 * Bulk ID cards (web PrintIdCardsDialog): A4 sheets, 10 cards each with cut marks, for the whole branch, a class
 * or a section. The PDF opens when ready and [onPrinted] gets the card count. Needs `students.edit`. [sectionId] is preselected when given.
 */
@Composable
fun PrintIdCardsSheet(branchId: String?, sectionId: String?, onPrinted: (count: Int) -> Unit, onDismiss: () -> Unit) {
    val viewModel: PrintIdCardsViewModel = hiltViewModel()
    LaunchedEffect(branchId, sectionId) { viewModel.open(branchId, sectionId) }
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val external = rememberExternalActions()
    LaunchedEffect(state.result) {
        val result = state.result ?: return@LaunchedEffect
        viewModel.resultHandled()
        external.open(result.fileUrl)
        onPrinted(result.count)
    }
    val dismiss = {
        viewModel.cancel()
        onDismiss()
    }
    AppBottomSheet(title = stringResource(R.string.sd_print_cards), onDismiss = dismiss) {
        Text(stringResource(R.string.sd_print_hint), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
        val loadError = state.loadError
        when {
            state.isLoading -> LoadingState(rows = 1)
            loadError != null -> InlineMessage(loadErrorMessage(loadError), StatusTone.Error)
            else -> {
                val wholeBranch = stringResource(R.string.sd_print_whole_branch)
                CreatablePickerField(
                    label = stringResource(R.string.sd_print_target),
                    options = state.options.map { option -> PickerOption(option.id, optionLabel(option, wholeBranch), optionSupporting(option)) },
                    selectedId = state.selectedId,
                    onSelect = { it?.let(viewModel::select) },
                    enabled = !state.printing,
                )
                if (state.printing) InlineMessage(stringResource(R.string.sd_print_working), StatusTone.Info)
                state.printError?.let { InlineMessage(fileJobMessage(it), StatusTone.Error) }
                PrimaryButton(
                    text = stringResource(R.string.sd_print_submit),
                    onClick = viewModel::print,
                    modifier = Modifier.fillMaxWidth(),
                    enabled = state.selectedId != null,
                    loading = state.printing,
                    leadingIcon = Icons.Outlined.Print,
                )
            }
        }
    }
}

@Composable
private fun optionLabel(option: PrintOption, wholeBranch: String): String = when (option.kind) {
    PrintOption.Kind.BRANCH -> wholeBranch
    PrintOption.Kind.CLASS -> stringResource(R.string.sd_print_class_all, option.label)
    PrintOption.Kind.SECTION -> option.label
}

@Composable
private fun optionSupporting(option: PrintOption): String? =
    option.count?.let { pluralStringResource(R.plurals.sd_print_students, it, it) }
