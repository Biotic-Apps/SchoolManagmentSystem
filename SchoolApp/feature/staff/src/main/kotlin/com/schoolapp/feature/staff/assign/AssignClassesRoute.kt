package com.schoolapp.feature.staff.assign

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Class
import androidx.compose.material.icons.outlined.Lock
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
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.AppTopBar
import com.schoolapp.core.designsystem.component.BackButton
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.FilterChipRow
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.staff.R
import com.schoolapp.feature.staff.form.FormMaxWidth

/** Skippable "Assign classes" step; [onDone] opens the staff profile (after saving or "Do it later"). */
@Composable
fun AssignClassesRoute(
    onDone: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: AssignClassesViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    LaunchedEffect(state.done) { if (state.done) onDone() }
    BackHandler(onBack = onDone)
    AppScaffold(
        modifier = modifier,
        topBar = {
            AppTopBar(
                title = stringResource(R.string.staff_assign_title),
                subtitle = state.staffName.ifBlank { null },
                navigationIcon = { BackButton(onDone) },
                actions = { AppTextButton(stringResource(R.string.staff_assign_later), onDone, enabled = !state.isSaving) },
            )
        },
    ) { padding ->
        val body = Modifier.padding(padding)
        when {
            !state.canAllocate -> EmptyState(stringResource(R.string.staff_assign_no_permission), body, icon = Icons.Outlined.Lock)
            state.isLoading -> LoadingState(body)
            state.loadError != null -> ErrorState(appErrorMessage(state.loadError!!), body, onRetry = viewModel::load)
            state.classes.isEmpty() -> EmptyState(
                stringResource(R.string.staff_assign_no_classes),
                body,
                message = stringResource(R.string.staff_assign_no_classes_hint),
                icon = Icons.Outlined.Class,
                action = { SecondaryButton(stringResource(R.string.staff_assign_later), onDone) },
            )
            else -> AssignClassesContent(state, viewModel, onDone, body)
        }
    }
}

@Composable
private fun AssignClassesContent(state: AssignClassesUiState, viewModel: AssignClassesViewModel, onDone: () -> Unit, modifier: Modifier) {
    val allocation = state.selectedAllocation
    val enabled = !state.isSaving
    ScreenColumn(modifier, maxWidth = FormMaxWidth) {
        item(key = "intro") {
            Text(stringResource(R.string.staff_assign_intro), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
        }
        state.saveError?.let { error ->
            item(key = "error") {
                InlineMessage(
                    pluralStringResource(R.plurals.staff_assign_failed, state.failedCount, state.failedCount, appErrorMessage(error)),
                    StatusTone.Error,
                )
            }
        }
        item(key = "classes") { FilterChipRow(state.classes, state.selectedClassId, viewModel::selectClass) }
        when {
            state.classLoading && allocation == null -> item(key = "loading") { LoadingState() }
            state.classError != null -> item(key = "classError") {
                ErrorState(appErrorMessage(state.classError), onRetry = { state.selectedClassId?.let(viewModel::selectClass) })
            }
            allocation != null && !allocation.canAllocate -> item(key = "readonly") {
                InlineMessage(stringResource(R.string.staff_assign_no_permission), StatusTone.Info)
            }
            allocation != null -> {
                item(key = "ct-${allocation.classId}") {
                    ClassTeacherCard(allocation, state.staffId, state.classTeacherOf, enabled, viewModel::toggleClassTeacher)
                }
                item(key = "sub-${allocation.classId}") {
                    SubjectTeacherCard(allocation, state.staffId, state.subjectPicks, enabled, viewModel::toggleSubject)
                }
            }
        }
        item(key = "save") {
            PrimaryButton(
                text = if (state.pickCount == 0) {
                    stringResource(R.string.staff_assign_save_none)
                } else {
                    pluralStringResource(R.plurals.staff_assign_save, state.pickCount, state.pickCount)
                },
                onClick = viewModel::save,
                enabled = state.pickCount > 0,
                loading = state.isSaving,
            )
        }
        item(key = "later") { SecondaryButton(stringResource(R.string.staff_assign_later), onDone, enabled = enabled) }
    }
}
