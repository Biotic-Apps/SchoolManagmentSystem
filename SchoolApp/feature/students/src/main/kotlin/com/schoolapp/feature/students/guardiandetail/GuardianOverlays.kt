package com.schoolapp.feature.students.guardiandetail

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.AppTextArea
import com.schoolapp.core.designsystem.component.ConfirmDialog
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.ui.SecureWindowEffect
import com.schoolapp.core.ui.actionErrorMessage
import com.schoolapp.core.ui.people.GuardianFields
import com.schoolapp.feature.students.R
import com.schoolapp.feature.students.parentlogin.ParentLoginCard

/** Edit / unlink sheets, the sign-in confirm dialog and the one-time password sheet of the guardian page. */
@Composable
internal fun GuardianOverlays(state: GuardianDetailUiState, viewModel: GuardianDetailViewModel) {
    val sheets = viewModel.sheets
    when (val sheet = state.sheet) {
        null -> Unit
        is GuardianSheet.Edit -> AppBottomSheet(stringResource(R.string.students_edit_guardian), sheets::close) {
            GuardianFields(sheet.form, sheet.errors, "", sheets::onEdit)
            sheet.error?.let { InlineMessage(actionErrorMessage(it.error, it.details), StatusTone.Error) }
            PrimaryButton(stringResource(R.string.students_save), sheets::saveEdit, Modifier.fillMaxWidth(), loading = sheet.saving)
        }
        is GuardianSheet.Unlink -> AppBottomSheet(stringResource(R.string.students_unlink_title, sheet.child.name), sheets::close) {
            InlineMessage(stringResource(R.string.students_unlink_message, state.detail?.guardian?.name.orEmpty(), sheet.child.name), StatusTone.Warning)
            AppTextArea(
                value = sheet.reason,
                onValueChange = sheets::onUnlinkReason,
                label = stringResource(R.string.students_reason),
                errorText = if (sheet.reasonError) stringResource(R.string.students_reason_min) else null,
            )
            sheet.error?.let { InlineMessage(actionErrorMessage(it.error, it.details), StatusTone.Error) }
            PrimaryButton(stringResource(R.string.students_unlink), sheets::confirmUnlink, Modifier.fillMaxWidth(), loading = sheet.saving)
        }
    }
    state.confirm?.let { action ->
        val name = state.detail?.guardian?.name.orEmpty()
        ConfirmDialog(
            title = stringResource(if (action == SignInAction.CREATE) R.string.students_give_sign_in_title else R.string.students_new_password_title, name),
            message = stringResource(if (action == SignInAction.CREATE) R.string.students_give_sign_in_message else R.string.students_new_password_message),
            confirmLabel = stringResource(if (action == SignInAction.CREATE) R.string.students_give_sign_in else R.string.students_new_password),
            onConfirm = viewModel::confirmSignIn,
            onDismiss = viewModel::dismissConfirm,
            destructive = action == SignInAction.RESET,
        )
    }
    state.revealed?.let { revealed ->
        if (revealed.login.temporaryPassword != null) SecureWindowEffect()
        val title = if (revealed.title == SignInAction.CREATE) {
            stringResource(R.string.students_can_sign_in, revealed.login.guardianName)
        } else {
            stringResource(R.string.students_new_password_for, revealed.login.guardianName)
        }
        AppBottomSheet(title, viewModel::dismissRevealed) {
            ParentLoginCard(revealed.login, revealed.admissionNo)
            if (revealed.login.temporaryPassword != null) {
                InlineMessage(stringResource(R.string.students_temp_password_once), StatusTone.Warning)
            }
            PrimaryButton(stringResource(R.string.students_done), viewModel::dismissRevealed, Modifier.fillMaxWidth())
        }
    }
}
