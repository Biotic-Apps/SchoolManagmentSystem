package com.schoolapp.feature.payroll.setup

import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Groups
import androidx.compose.material.icons.outlined.PersonAdd
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.data.fees.scope.FinanceBranch
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.FilterChipRow
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.model.SessionContext
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.payroll.R
import com.schoolapp.feature.payroll.setup.components.StaffSalaryRow
import com.schoolapp.feature.payroll.setup.detail.SalaryDetailDestination

/** "Salary setup": who has a salary, who is missing one, and the principal; tap a name to open their salary. */
@Composable
internal fun SalarySetupTab(
    branch: FinanceBranch,
    session: SessionContext,
    onOpen: (Any) -> Unit,
    modifier: Modifier = Modifier,
    viewModel: SalarySetupViewModel = hiltViewModel(key = "payroll_setup_${branch.id}"),
) {
    LaunchedEffect(branch.id) { viewModel.start(branch.id) }
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val canEdit = session.has(PAYROLL_EDIT)
    val typeOptions = listOf(SwitcherOption(ALL_TYPES, stringResource(R.string.payroll_setup_all_types))) +
        StaffType.entries.map { SwitcherOption(it.name, stringResource(it.label)) }
    RefreshBox(state.isRefreshing, viewModel::refresh, modifier) {
        ScreenColumn {
            item(key = "types") { FilterChipRow(typeOptions, state.staffType, viewModel::onStaffType) }
            if (state.principalAdded) {
                item(key = "added") { InlineMessage(stringResource(R.string.payroll_setup_principal_added), StatusTone.Success) }
            }
            state.actionError?.let { item(key = "action_error") { InlineMessage(appErrorMessage(it), StatusTone.Error) } }
            val list = state.list
            when {
                state.isLoading && list == null -> item(key = "loading") { LoadingState() }
                state.error != null && list == null ->
                    item(key = "error") { ErrorState(appErrorMessage(state.error!!), onRetry = viewModel::retry) }
                list != null -> {
                    if (state.principalMissing) {
                        item(key = "principal") {
                            AppCard {
                                SectionHeader(
                                    title = stringResource(R.string.payroll_setup_principal_missing, list.principal?.name.orEmpty()),
                                    subtitle = stringResource(R.string.payroll_setup_principal_missing_message),
                                )
                                if (canEdit) {
                                    PrimaryButton(
                                        text = stringResource(R.string.payroll_setup_add_principal),
                                        onClick = viewModel::addPrincipal,
                                        loading = state.addingPrincipal,
                                        leadingIcon = Icons.Outlined.PersonAdd,
                                    )
                                }
                            }
                        }
                    }
                    if (list.missingCount > 0) {
                        item(key = "missing") {
                            InlineMessage(pluralStringResource(R.plurals.payroll_setup_missing, list.missingCount, list.missingCount), StatusTone.Warning)
                        }
                    }
                    if (list.items.isEmpty()) {
                        item(key = "empty") {
                            EmptyState(
                                title = stringResource(R.string.payroll_setup_empty),
                                message = stringResource(R.string.payroll_setup_empty_message),
                                icon = Icons.Outlined.Groups,
                            )
                        }
                    }
                    items(list.items, key = { "staff_${it.staffId}" }) { staff ->
                        StaffSalaryRow(staff, onClick = {
                            onOpen(SalaryDetailDestination(staff.staffId, staff.name, staff.designation))
                        })
                    }
                }
            }
        }
    }
}

internal const val PAYROLL_EDIT = "payroll.edit"
