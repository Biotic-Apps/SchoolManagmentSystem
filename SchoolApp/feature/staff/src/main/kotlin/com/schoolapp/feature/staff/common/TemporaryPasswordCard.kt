package com.schoolapp.feature.staff.common

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
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
import androidx.compose.ui.unit.sp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.KeyValueRow
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.ui.SecureWindowEffect
import com.schoolapp.feature.staff.R

/**
 * One-time temporary password with Copy / Share and the "shown once" warning. Used after adding staff,
 * creating a sign-in for existing staff and resetting a password. Screenshots are blocked while it shows.
 */
@Composable
internal fun TemporaryPasswordCard(name: String, signIn: String?, password: String, modifier: Modifier = Modifier) {
    SecureWindowEffect()
    val context = LocalContext.current
    Column(modifier, verticalArrangement = Arrangement.spacedBy(12.dp)) {
        AppCard(Modifier.fillMaxWidth()) {
            Text(stringResource(R.string.staff_temp_password), style = MaterialTheme.typography.titleMedium, color = AppColors.TextPrimary)
            signIn?.let { KeyValueRow(stringResource(R.string.staff_sign_in_with), it) }
            SelectionContainer {
                Text(
                    password,
                    style = MaterialTheme.typography.headlineSmall.copy(fontFamily = FontFamily.Monospace, letterSpacing = 1.sp),
                    fontWeight = FontWeight.SemiBold,
                    color = AppColors.TextPrimary,
                )
            }
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                SecondaryButton(
                    text = stringResource(R.string.staff_copy),
                    onClick = { CredentialActions.copy(context, password) },
                    leadingIcon = Icons.Outlined.ContentCopy,
                    modifier = Modifier.weight(1f),
                )
                SecondaryButton(
                    text = stringResource(R.string.staff_share),
                    onClick = { CredentialActions.share(context, name, signIn, password) },
                    leadingIcon = Icons.Outlined.Share,
                    modifier = Modifier.weight(1f),
                )
            }
        }
        InlineMessage(stringResource(R.string.staff_temp_password_once), StatusTone.Warning)
    }
}
