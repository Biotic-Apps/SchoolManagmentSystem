package com.schoolapp.feature.organisation.branches.edit

import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.CreatablePickerField
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.PickerOption
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.organisation.R
import com.schoolapp.feature.organisation.components.ActionErrorMessage

/** Super admin: hand a branch to another user holding the Principal role. */
@Composable
internal fun ChangePrincipalSheet(form: PrincipalForm, tools: BranchToolsEditor) {
    AppBottomSheet(title = stringResource(R.string.org_change_principal_of, form.branch.name), onDismiss = tools::dismissPrincipal) {
        InlineMessage(stringResource(R.string.org_change_principal_warning), StatusTone.Warning)
        val options = form.options
        when {
            options != null -> {
                CreatablePickerField(
                    label = stringResource(R.string.org_new_principal),
                    options = options.map { PickerOption(it.id, it.name) },
                    selectedId = form.userId,
                    onSelect = tools::selectPrincipal,
                    errorText = if (form.missing) stringResource(R.string.org_pick_principal) else null,
                    fallbackValue = form.branch.principalName.takeIf { form.userId == form.branch.principalId },
                )
                if (options.isEmpty()) InlineMessage(stringResource(R.string.org_no_principals), StatusTone.Info)
                ActionErrorMessage(form.error)
                PrimaryButton(stringResource(R.string.org_change_principal), onClick = tools::savePrincipal, loading = form.saving)
            }
            form.loadError != null -> ErrorState(appErrorMessage(form.loadError), onRetry = tools::loadPrincipals)
            else -> LoadingState()
        }
    }
}
