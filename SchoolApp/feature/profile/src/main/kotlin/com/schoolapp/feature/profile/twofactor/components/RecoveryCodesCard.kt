package com.schoolapp.feature.profile.twofactor.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
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
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.feature.profile.R
import com.schoolapp.feature.profile.twofactor.TwoFactorActions

/** Shown once: the codes in a monospace grid with Copy all, Share and "I have saved them". */
@Composable
internal fun RecoveryCodesCard(
    codes: List<String>,
    account: String,
    onSaved: () -> Unit,
    onMessage: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    val context = LocalContext.current
    val copied = stringResource(R.string.two_factor_codes_copied)
    val label = stringResource(R.string.two_factor_codes_title)
    val text = { TwoFactorActions.recoveryCodesText(context, account, codes) }
    AppCard(modifier.fillMaxWidth()) {
        Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            SectionHeader(title = label)
            InlineMessage(stringResource(R.string.two_factor_codes_warning), StatusTone.Warning)
            SelectionContainer {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    codes.chunked(COLUMNS).forEach { row ->
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            row.forEach { code ->
                                Text(
                                    text = code,
                                    style = MaterialTheme.typography.titleMedium.copy(fontFamily = FontFamily.Monospace),
                                    color = AppColors.TextPrimary,
                                    textAlign = TextAlign.Center,
                                    modifier = Modifier.weight(1f),
                                )
                            }
                            repeat(COLUMNS - row.size) { Spacer(Modifier.weight(1f)) }
                        }
                    }
                }
            }
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                SecondaryButton(
                    text = stringResource(R.string.two_factor_copy_all),
                    leadingIcon = Icons.Outlined.ContentCopy,
                    onClick = {
                        TwoFactorActions.copy(context, label, text())
                        onMessage(copied)
                    },
                    modifier = Modifier.weight(1f),
                )
                SecondaryButton(
                    text = stringResource(R.string.two_factor_share),
                    leadingIcon = Icons.Outlined.Share,
                    onClick = { TwoFactorActions.share(context, text()) },
                    modifier = Modifier.weight(1f),
                )
            }
            PrimaryButton(
                text = stringResource(R.string.two_factor_codes_saved),
                onClick = onSaved,
                modifier = Modifier.fillMaxWidth(),
            )
        }
    }
}

private const val COLUMNS = 2
