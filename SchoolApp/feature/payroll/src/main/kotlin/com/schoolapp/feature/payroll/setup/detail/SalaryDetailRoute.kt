package com.schoolapp.feature.payroll.setup.detail

import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Edit
import androidx.compose.material.icons.outlined.Wallet
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavHostController
import androidx.navigation.compose.composable
import androidx.navigation.toRoute
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.AppTopBar
import com.schoolapp.core.designsystem.component.BackButton
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.ui.SecureWindowEffect
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.payroll.R
import com.schoolapp.feature.payroll.setup.staffTypeLabel
import kotlinx.serialization.Serializable

/** One staff member's salary structure (FLAG_SECURE). */
@Serializable
internal data class SalaryDetailDestination(val staffId: String, val name: String, val designation: String? = null)

fun NavGraphBuilder.payrollSetupDestinations(navController: NavHostController) {
    composable<SalaryDetailDestination> { entry ->
        val args = entry.toRoute<SalaryDetailDestination>()
        SalaryDetailRoute(
            name = args.name,
            designation = args.designation,
            onBack = navController::popBackStack,
        )
    }
}

@Composable
internal fun SalaryDetailRoute(
    name: String,
    designation: String?,
    onBack: () -> Unit,
    viewModel: SalaryDetailViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    SecureWindowEffect(true)
    AppScaffold(
        topBar = {
            AppTopBar(
                title = stringResource(R.string.payroll_setup_salary_title, name),
                subtitle = staffTypeLabel(designation),
                navigationIcon = { BackButton(onBack) },
            )
        },
    ) { padding ->
        val structures = state.structures
        when {
            state.isLoading && structures == null -> LoadingState(Modifier.padding(padding))
            structures == null -> ErrorState(state.error?.let { appErrorMessage(it) }.orEmpty(), Modifier.padding(padding), onRetry = viewModel::retry)
            else -> ScreenColumn(Modifier.padding(padding)) {
                if (state.saved) item(key = "saved") { InlineMessage(stringResource(R.string.payroll_setup_saved), StatusTone.Success) }
                val form = state.form
                if (form != null) {
                    item(key = "form") {
                        SalaryFormCard(
                            form = form,
                            isChange = structures.current != null,
                            isSaving = state.isSaving,
                            saveError = state.saveError,
                            onEdit = viewModel::edit,
                            onSave = viewModel::save,
                            onCancel = viewModel::cancelEdit,
                        )
                    }
                    return@ScreenColumn
                }
                val current = structures.current
                if (state.canEdit && !state.isOwn) {
                    item(key = "edit") {
                        PrimaryButton(
                            text = stringResource(if (current == null) R.string.payroll_setup_set_salary else R.string.payroll_setup_change_salary),
                            onClick = viewModel::startEdit,
                            leadingIcon = Icons.Outlined.Edit,
                        )
                    }
                }
                if (current == null) {
                    item(key = "none") {
                        EmptyState(
                            title = stringResource(R.string.payroll_setup_none_title),
                            message = stringResource(
                                when {
                                    state.isOwn -> R.string.payroll_setup_none_own
                                    state.canEdit -> R.string.payroll_setup_none_can_edit
                                    else -> R.string.payroll_setup_none_read_only
                                },
                            ),
                            icon = Icons.Outlined.Wallet,
                        )
                    }
                } else {
                    item(key = "current") { StructureSummaryCard(current, stringResource(R.string.payroll_setup_current)) }
                }
                if (structures.history.isNotEmpty()) {
                    item(key = "history_header") { SectionHeader(stringResource(R.string.payroll_setup_history)) }
                    items(structures.history, key = { "h_${it.id}_${it.effectiveFrom}" }) { old ->
                        StructureSummaryCard(old, stringResource(R.string.payroll_setup_history))
                    }
                }
            }
        }
    }
}
