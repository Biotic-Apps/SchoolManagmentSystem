package com.schoolapp.applock

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.schoolapp.R
import com.schoolapp.core.designsystem.brand.BrandMark
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.designsystem.theme.SchoolTheme

/** Full-screen lock. Sign-out is always offered so a lost device lock never traps the user. */
@Composable
fun AppLockScreen(
    state: AppLockUiState,
    onUnlock: () -> Unit,
    onSignOut: () -> Unit,
    modifier: Modifier = Modifier,
) {
    AppScaffold(modifier = modifier) { padding ->
        Box(
            Modifier.fillMaxSize().padding(padding).verticalScroll(rememberScrollState()),
            contentAlignment = Alignment.Center,
        ) {
            Column(
                modifier = Modifier.widthIn(max = 440.dp).fillMaxWidth().padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(16.dp),
            ) {
                BrandMark(logoUrl = null)
                Text(
                    text = stringResource(R.string.app_lock_title),
                    style = MaterialTheme.typography.headlineSmall,
                    color = AppColors.TextPrimary,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.semantics { heading() },
                )
                Text(
                    text = stringResource(if (state.canUnlock != false) R.string.app_lock_message else R.string.app_lock_unavailable),
                    style = MaterialTheme.typography.bodyLarge,
                    color = AppColors.TextSecondary,
                    textAlign = TextAlign.Center,
                )
                state.error?.let { InlineMessage(text = it, tone = StatusTone.Error) }
                if (state.canUnlock != false) {
                    PrimaryButton(stringResource(R.string.app_lock_unlock), onClick = onUnlock, modifier = Modifier.fillMaxWidth())
                    AppTextButton(stringResource(R.string.app_lock_sign_out), onClick = onSignOut, contentColor = AppColors.TextSecondary)
                } else {
                    PrimaryButton(stringResource(R.string.app_lock_sign_out), onClick = onSignOut, modifier = Modifier.fillMaxWidth())
                }
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
private fun AppLockScreenPreview() = SchoolTheme { AppLockScreen(AppLockUiState(), onUnlock = {}, onSignOut = {}) }

@Preview(showBackground = true)
@Composable
private fun AppLockScreenUnavailablePreview() = SchoolTheme {
    AppLockScreen(AppLockUiState(canUnlock = false), onUnlock = {}, onSignOut = {})
}
