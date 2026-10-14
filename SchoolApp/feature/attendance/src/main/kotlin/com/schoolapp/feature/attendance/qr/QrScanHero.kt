package com.schoolapp.feature.attendance.qr

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.QrCodeScanner
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.IconTile
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.feature.attendance.R

/** Scanner card: what to do, and the scan button (busy while the scan is being recorded). */
@Composable
internal fun QrScanHero(state: QrScanUiState, onScan: () -> Unit, modifier: Modifier = Modifier) {
    AppCard(modifier.fillMaxWidth(), verticalSpacing = 12.dp) {
        IconTile(Icons.Outlined.QrCodeScanner, StatusTone.Info, size = 64.dp, modifier = Modifier.align(Alignment.CenterHorizontally))
        Text(
            stringResource(if (state.isProcessing) R.string.qr_processing else R.string.qr_ready_title),
            style = MaterialTheme.typography.titleMedium,
            color = AppColors.TextPrimary,
            textAlign = TextAlign.Center,
            modifier = Modifier.fillMaxWidth(),
        )
        Text(
            stringResource(R.string.qr_ready_message),
            style = MaterialTheme.typography.bodyMedium,
            color = AppColors.TextSecondary,
            textAlign = TextAlign.Center,
            modifier = Modifier.fillMaxWidth(),
        )
        PrimaryButton(
            text = stringResource(if (state.lastResult != null) R.string.qr_scan_next else R.string.qr_scan_button),
            onClick = onScan,
            loading = state.isProcessing,
            leadingIcon = Icons.Outlined.QrCodeScanner,
            modifier = Modifier.fillMaxWidth(),
        )
    }
}
