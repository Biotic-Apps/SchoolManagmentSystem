package com.schoolapp.feature.admin.schools.setup.steps

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.CheckCircle
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.schools.SchoolSetupResult
import com.schoolapp.feature.admin.R
import com.schoolapp.feature.admin.common.AdminFormMaxWidth
import com.schoolapp.feature.admin.common.TemporaryPasswordCard

/** After creating: what exists now and the principal's one-time sign-in details (web SetupSuccess). */
@Composable
internal fun SetupSuccess(result: SchoolSetupResult, onDone: () -> Unit, modifier: Modifier = Modifier) {
    ScreenColumn(modifier, maxWidth = AdminFormMaxWidth) {
        item(key = "ready") {
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                Icon(Icons.Outlined.CheckCircle, contentDescription = null, tint = AppColors.Success, modifier = Modifier.size(28.dp))
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Text(
                        stringResource(R.string.setup_ready, result.schoolName, result.branchName),
                        style = MaterialTheme.typography.titleMedium,
                        color = AppColors.TextPrimary,
                    )
                    Text(createdLine(result), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
                }
            }
        }
        item(key = "principal") {
            val password = result.temporaryPassword
            val signIn = result.principalEmail ?: result.principalPhone
            if (password != null) {
                TemporaryPasswordCard(
                    name = result.principalName,
                    signIn = signIn,
                    password = password,
                    title = stringResource(R.string.setup_principal_sign_in, result.principalName),
                )
            } else {
                InlineMessage(stringResource(R.string.setup_password_you_set, result.principalName, signIn.orEmpty()), StatusTone.Info)
            }
        }
        item(key = "welcome") {
            Text(stringResource(R.string.setup_welcome_sent), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
        }
        item(key = "done") { PrimaryButton(stringResource(R.string.setup_done), onDone, Modifier.fillMaxWidth()) }
    }
}

@Composable
private fun createdLine(result: SchoolSetupResult): String {
    val session = result.sessionName ?: return stringResource(R.string.setup_no_session_yet)
    return stringResource(
        R.string.setup_session_active,
        session,
        pluralStringResource(R.plurals.setup_class_count, result.classes, result.classes),
        pluralStringResource(R.plurals.setup_section_count, result.sections, result.sections),
        pluralStringResource(R.plurals.setup_subject_count, result.subjects, result.subjects),
    )
}
