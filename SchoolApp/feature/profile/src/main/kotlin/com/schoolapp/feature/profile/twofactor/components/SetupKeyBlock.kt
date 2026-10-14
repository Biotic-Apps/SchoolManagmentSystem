package com.schoolapp.feature.profile.twofactor.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.text.selection.SelectionContainer
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.OpenInNew
import androidx.compose.material.icons.outlined.ContentCopy
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.profile.TwoFactorSetup
import com.schoolapp.feature.profile.R
import com.schoolapp.feature.profile.twofactor.TwoFactorActions

/** The base32 key in groups of four, with Copy and "Open authenticator app". */
@Composable
internal fun SetupKeyBlock(
    setup: TwoFactorSetup,
    onMessage: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    val context = LocalContext.current
    val copiedText = stringResource(R.string.two_factor_key_copied)
    val noAppText = stringResource(R.string.two_factor_no_authenticator)
    val keyLabel = stringResource(R.string.two_factor_setup_key)
    Column(modifier, verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Text(keyLabel, style = MaterialTheme.typography.labelLarge, color = AppColors.TextSecondary)
        SelectionContainer {
            Text(
                text = TwoFactorActions.groupSecret(setup.secret),
                style = MaterialTheme.typography.titleMedium.copy(fontFamily = FontFamily.Monospace),
                color = AppColors.TextPrimary,
            )
        }
        SecondaryButton(
            text = stringResource(R.string.two_factor_copy_key),
            leadingIcon = Icons.Outlined.ContentCopy,
            onClick = {
                TwoFactorActions.copy(context, keyLabel, setup.secret)
                onMessage(copiedText)
            },
            modifier = Modifier.fillMaxWidth(),
        )
        SecondaryButton(
            text = stringResource(R.string.two_factor_open_app),
            leadingIcon = Icons.AutoMirrored.Outlined.OpenInNew,
            onClick = { if (!TwoFactorActions.openAuthenticator(context, setup.otpauthUrl)) onMessage(noAppText) },
            modifier = Modifier.fillMaxWidth(),
        )
    }
}
