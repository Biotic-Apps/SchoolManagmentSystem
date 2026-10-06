package com.schoolapp.feature.pickup.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Block
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.feature.pickup.R

/** Prominent error state when the gate tried to hand a student to an unauthorized person. */
@Composable
internal fun PickupBlockedCard(pickerName: String, onChooseAnother: () -> Unit, modifier: Modifier = Modifier) {
    Surface(
        modifier = modifier.fillMaxWidth(),
        shape = MaterialTheme.shapes.medium,
        color = AppColors.ErrorContainer,
        border = BorderStroke(1.dp, AppColors.Error),
    ) {
        Column(
            modifier = Modifier.padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Icon(Icons.Outlined.Block, contentDescription = null, tint = AppColors.Error, modifier = Modifier.size(48.dp))
            Text(
                stringResource(R.string.pickup_blocked_title),
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
                color = AppColors.Error,
                textAlign = TextAlign.Center,
            )
            Text(
                stringResource(R.string.pickup_blocked_message, pickerName),
                style = MaterialTheme.typography.bodyLarge,
                color = AppColors.TextPrimary,
                textAlign = TextAlign.Center,
            )
            PrimaryButton(stringResource(R.string.pickup_choose_another), onChooseAnother, modifier = Modifier.fillMaxWidth())
        }
    }
}
