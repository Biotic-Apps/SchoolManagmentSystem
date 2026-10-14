package com.schoolapp.feature.students.parentlogin

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
import com.schoolapp.core.designsystem.component.KeyValueRow
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.admissions.ParentLogin
import com.schoolapp.core.ui.humanizeKey
import com.schoolapp.feature.students.R

/**
 * One guardian's parent sign-in: username (the child's admission number, or the phone/email) and, when just
 * created or reset, the one-time temporary password with Copy and Share.
 */
@Composable
internal fun ParentLoginCard(login: ParentLogin, admissionNo: String?, modifier: Modifier = Modifier) {
    val context = LocalContext.current
    val username = admissionNo ?: login.phone ?: login.email
    AppCard(modifier.fillMaxWidth(), verticalSpacing = 8.dp) {
        SectionHeader(title = login.guardianName, action = { StatusChip(humanizeKey(login.status), loginTone(login.status)) })
        username?.let { KeyValueRow(stringResource(R.string.students_login_username), it) }
        listOfNotNull(login.phone, login.email).filter { it != username }.takeIf { it.isNotEmpty() }?.let {
            KeyValueRow(stringResource(R.string.students_login_also), it.joinToString(" · "))
        }
        login.reason?.let { Text(it, style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary) }
        if (login.status == EXISTING) {
            Text(stringResource(R.string.students_login_existing), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
        }
        login.temporaryPassword?.let { password ->
            Text(stringResource(R.string.students_temp_password), style = MaterialTheme.typography.labelMedium, color = AppColors.TextSecondary)
            SelectionContainer {
                Text(password, style = MaterialTheme.typography.headlineSmall.copy(fontFamily = FontFamily.Monospace), fontWeight = FontWeight.SemiBold)
            }
        }
        if (login.status != SKIPPED && username != null) {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                login.temporaryPassword?.let { password ->
                    SecondaryButton(
                        stringResource(R.string.students_copy), { ParentLoginActions.copy(context, password) },
                        Modifier.weight(1f), leadingIcon = Icons.Outlined.ContentCopy,
                    )
                }
                SecondaryButton(
                    stringResource(R.string.students_share), { ParentLoginActions.share(context, login.guardianName, username, login.temporaryPassword) },
                    Modifier.weight(1f), leadingIcon = Icons.Outlined.Share,
                )
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
private const val SKIPPED = "SKIPPED"
