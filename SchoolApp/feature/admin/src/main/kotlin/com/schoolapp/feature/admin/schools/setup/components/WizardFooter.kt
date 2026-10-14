package com.schoolapp.feature.admin.schools.setup.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.navigationBars
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.ArrowForward
import androidx.compose.material.icons.outlined.Check
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.feature.admin.R
import com.schoolapp.feature.admin.common.AdminFormMaxWidth
import com.schoolapp.feature.admin.schools.setup.SetupUiState

/** Error banner plus Back / Next (or "Create school" on the review step). */
@Composable
internal fun WizardFooter(state: SetupUiState, onBack: () -> Unit, onNext: () -> Unit, modifier: Modifier = Modifier) {
    Surface(modifier.fillMaxWidth(), color = AppColors.Surface) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            HorizontalDivider(color = AppColors.Border)
            Column(
                Modifier.widthIn(max = AdminFormMaxWidth).fillMaxWidth().windowInsetsPadding(WindowInsets.navigationBars).padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                val banner = state.banner ?: state.bannerRes?.let { stringResource(it) }
                    ?: stringResource(R.string.setup_error_generic).takeIf { state.genericError }
                banner?.let { InlineMessage(it, StatusTone.Error) }
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    if (state.step.ordinal > 0) {
                        SecondaryButton(
                            text = stringResource(R.string.setup_back),
                            onClick = onBack,
                            enabled = !state.isSubmitting,
                            modifier = Modifier.weight(1f),
                        )
                    }
                    PrimaryButton(
                        text = stringResource(if (state.isReview) R.string.setup_create else R.string.setup_next),
                        onClick = onNext,
                        loading = state.isSubmitting,
                        enabled = !state.isSubmitting,
                        leadingIcon = if (state.isReview) Icons.Outlined.Check else Icons.AutoMirrored.Outlined.ArrowForward,
                        modifier = Modifier.weight(1f),
                    )
                }
            }
        }
    }
}
