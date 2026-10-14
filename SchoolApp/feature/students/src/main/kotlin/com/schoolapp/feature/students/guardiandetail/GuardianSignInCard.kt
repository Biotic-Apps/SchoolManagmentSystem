package com.schoolapp.feature.students.guardiandetail

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Key
import androidx.compose.material.icons.outlined.LockReset
import androidx.compose.material.icons.outlined.Send
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.ui.actionErrorMessage
import com.schoolapp.core.ui.formatTimestamp
import com.schoolapp.feature.students.R

/** How the guardian signs in to the parent app (web GuardianSignInPanel), with staff actions. */
@Composable
internal fun GuardianSignInCard(
    state: GuardianDetailUiState,
    onCreate: () -> Unit,
    onReset: () -> Unit,
    onSend: () -> Unit,
    onDismissError: () -> Unit,
) {
    val detail = state.detail ?: return
    val login = detail.login
    val hasAccount = detail.guardian.hasAccount
    val username = state.usernameChild?.admissionNo
    AppCard(Modifier.fillMaxWidth(), verticalSpacing = 8.dp) {
        SectionHeader(
            title = stringResource(R.string.students_parent_logins),
            action = {
                when {
                    !hasAccount -> StatusChip(stringResource(R.string.students_no_sign_in), StatusTone.Neutral)
                    login?.isActive == false -> StatusChip(stringResource(R.string.students_sign_in_disabled), StatusTone.Error)
                    login?.mustChangePassword == true -> StatusChip(stringResource(R.string.students_sign_in_pending), StatusTone.Warning)
                    else -> StatusChip(stringResource(R.string.students_sign_in_active), StatusTone.Success)
                }
            },
        )
        val hint = when {
            !hasAccount -> stringResource(R.string.students_sign_in_hint_none)
            login?.mustChangePassword == true -> stringResource(R.string.students_sign_in_hint_temp, username ?: login?.phone ?: login?.email.orEmpty())
            else -> stringResource(R.string.students_sign_in_hint_active, username ?: login?.phone ?: login?.email.orEmpty())
        }
        Text(hint, style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
        login?.lastLoginAt?.let { formatTimestamp(it) }?.let {
            Text(stringResource(R.string.students_last_sign_in, it), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
        }
        state.actionError?.let { error ->
            InlineMessage(actionErrorMessage(error.error, error.details), StatusTone.Error)
            AppTextButton(stringResource(R.string.students_dismiss), onDismissError)
        }
        if (state.canEdit && !hasAccount) {
            PrimaryButton(stringResource(R.string.students_give_sign_in), onCreate, Modifier.fillMaxWidth(), leadingIcon = Icons.Outlined.Key)
        }
        if (state.canReset && hasAccount) {
            SecondaryButton(stringResource(R.string.students_new_password), onReset, Modifier.fillMaxWidth(), leadingIcon = Icons.Outlined.LockReset)
        }
        if (state.canEdit && hasAccount && login?.isActive == true) {
            SecondaryButton(
                stringResource(R.string.students_send_sign_in), onSend, Modifier.fillMaxWidth(),
                loading = state.sending, leadingIcon = Icons.Outlined.Send,
            )
        }
    }
}
