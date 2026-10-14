package com.schoolapp.feature.settings.school

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Check
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringArrayResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.selected
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.FieldKind
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.feature.settings.R

/** Preset swatches, hex field, live WCAG contrast and reset to default. */
@OptIn(ExperimentalLayoutApi::class)
@Composable
internal fun PrimaryColorSection(value: String, canEdit: Boolean, serverError: String?, onColor: (String) -> Unit) {
    val ratio = BrandColors.contrastOnWhite(value)
    val passes = ratio != null && ratio >= BrandColors.MIN_CONTRAST
    val message = when {
        ratio == null -> stringResource(R.string.settings_school_color_invalid)
        !passes -> stringResource(R.string.settings_school_color_too_light, BrandColors.MIN_CONTRAST.toString())
        else -> serverError
    }
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        SectionHeader(
            title = stringResource(R.string.settings_school_brand_colour),
            subtitle = stringResource(R.string.settings_school_brand_colour_hint),
        )
        ColorPresets(value, canEdit, onColor)
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.CenterVertically) {
            AppTextField(
                value = value,
                onValueChange = { if (it.length <= BrandColors.MAX_LENGTH) onColor(it) },
                label = stringResource(R.string.settings_school_primary_colour),
                enabled = canEdit,
                kind = FieldKind.Code,
                modifier = Modifier.width(HEX_WIDTH),
            )
            if (ratio != null) {
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Text(BrandColors.ratioText(ratio), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextPrimary)
                    StatusChip(
                        text = stringResource(if (passes) R.string.settings_school_passes_aa else R.string.settings_school_too_light),
                        tone = if (passes) StatusTone.Success else StatusTone.Error,
                    )
                }
            }
        }
        if (canEdit && value.trim().uppercase() != BrandColors.DEFAULT_PRIMARY) {
            AppTextButton(stringResource(R.string.settings_school_reset_colour), { onColor(BrandColors.DEFAULT_PRIMARY) })
        }
        Text(
            text = message ?: stringResource(R.string.settings_school_contrast_hint, BrandColors.MIN_CONTRAST.toString()),
            style = MaterialTheme.typography.bodySmall,
            color = if (message != null) AppColors.Error else AppColors.TextSecondary,
        )
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun ColorPresets(value: String, canEdit: Boolean, onColor: (String) -> Unit) {
    val names = stringArrayResource(R.array.settings_school_preset_names)
    val current = value.trim().uppercase()
    FlowRow(horizontalArrangement = Arrangement.spacedBy(10.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        BrandColors.PRESETS.forEachIndexed { index, hex ->
            val color = BrandColors.toColor(hex) ?: return@forEachIndexed
            val selected = current == hex
            Box(
                modifier = Modifier
                    .size(SWATCH)
                    .background(color, CircleShape)
                    .then(if (selected) Modifier.border(3.dp, AppColors.Border, CircleShape) else Modifier)
                    .clickable(enabled = canEdit, role = Role.RadioButton) { onColor(hex) }
                    .semantics {
                        contentDescription = names.getOrElse(index) { hex }
                        this.selected = selected
                    }
                    .padding(8.dp),
                contentAlignment = Alignment.Center,
            ) {
                if (selected) Icon(Icons.Outlined.Check, contentDescription = null, tint = AppColors.OnPrimary)
            }
        }
    }
}

private val HEX_WIDTH = 150.dp
private val SWATCH = 40.dp
