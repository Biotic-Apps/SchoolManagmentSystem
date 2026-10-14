package com.schoolapp.feature.admissions.confirm

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.text.selection.SelectionContainer
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.ContentCopy
import androidx.compose.material.icons.outlined.Share
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.KeyValueRow
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.admissions.ConfirmedAdmission
import com.schoolapp.core.model.admissions.ParentLogin
import com.schoolapp.core.ui.SecureWindowEffect
import com.schoolapp.core.ui.humanizeKey
import com.schoolapp.feature.admissions.R

/** "Enrolled": admission number and each guardian's parent sign-in (temporary passwords are shown once). */
@Composable
internal fun AdmissionDoneContent(childName: String, done: ConfirmedAdmission, onDone: () -> Unit, modifier: Modifier = Modifier) {
    SecureWindowEffect(enabled = done.parentLogins.any { it.temporaryPassword != null })
    ScreenColumn(modifier) {
        item { InlineMessage(stringResource(R.string.admissions_enrolled_message, childName), StatusTone.Success) }
        item {
            AppCard(Modifier.fillMaxWidth()) {
                SectionHeader(title = childName)
                KeyValueRow(stringResource(R.string.admissions_admission_no), done.admissionNo)
            }
        }
        if (done.parentLogins.isNotEmpty()) {
            item { SectionHeader(title = stringResource(R.string.admissions_parent_logins)) }
            done.parentLogins.forEachIndexed { index, login -> item(key = "login$index") { ParentLoginCard(login) } }
            if (done.parentLogins.any { it.temporaryPassword != null }) {
                item { InlineMessage(stringResource(R.string.admissions_temp_password_once), StatusTone.Warning) }
            }
        }
        item { PrimaryButton(stringResource(R.string.admissions_done), onDone, Modifier.fillMaxWidth()) }
    }
}

@Composable
private fun ParentLoginCard(login: ParentLogin) {
    val context = LocalContext.current
    val signIn = login.phone ?: login.email
    AppCard(Modifier.fillMaxWidth()) {
        SectionHeader(title = login.guardianName, action = { StatusChip(humanizeKey(login.status), loginTone(login.status)) })
        signIn?.let { KeyValueRow(stringResource(R.string.admissions_sign_in_with), it) }
        login.reason?.let { Text(it, style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary) }
        if (login.status == EXISTING) {
            Text(stringResource(R.string.admissions_login_existing), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
        }
        login.temporaryPassword?.let { password ->
            Text(stringResource(R.string.admissions_temp_password), style = MaterialTheme.typography.labelMedium, color = AppColors.TextSecondary)
            SelectionContainer {
                Text(password, style = MaterialTheme.typography.headlineSmall.copy(fontFamily = FontFamily.Monospace), fontWeight = FontWeight.SemiBold)
            }
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                SecondaryButton(stringResource(R.string.admissions_copy), { ParentLoginActions.copy(context, password) },
                    Modifier.weight(1f), leadingIcon = Icons.Outlined.ContentCopy)
                SecondaryButton(stringResource(R.string.admissions_share), { ParentLoginActions.share(context, login.guardianName, signIn.orEmpty(), password) },
                    Modifier.weight(1f), leadingIcon = Icons.Outlined.Share)
            }
        }
    }
}

private fun loginTone(status: String) = when (status) {
    "CREATED" -> StatusTone.Success
    EXISTING -> StatusTone.Info
    else -> StatusTone.Warning
}

private const val EXISTING = "EXISTING"
