package com.schoolapp.feature.settings.school

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.clearAndSetSemantics
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.brand.BrandMark
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.feature.settings.R

/** Mini login card and top bar drawn with the chosen colour (default colour until it passes the contrast check). */
@Composable
internal fun BrandPreviewCard(form: SchoolForm, savedName: String, modifier: Modifier = Modifier) {
    val color = if (form.colorPasses) BrandColors.toColor(form.primaryColor) ?: AppColors.Primary else AppColors.Primary
    val name = form.displayName.trim().ifBlank { savedName }
    val logo = form.logoUrl.takeIf { form.logoFileId != null }
    AppCard(modifier = modifier, verticalSpacing = 12.dp) {
        SectionHeader(
            title = stringResource(R.string.settings_school_preview),
            subtitle = stringResource(if (form.colorPasses) R.string.settings_school_preview_hint else R.string.settings_school_preview_default),
        )
        Column(Modifier.clearAndSetSemantics { }, verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Column(
                Modifier.fillMaxWidth().background(AppColors.Surface, SHAPE).border(1.dp, AppColors.Border, SHAPE).padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp),
            ) {
                BrandRow(name, logo, color, stringResource(R.string.settings_school_preview_sign_in_hint))
                FakeField()
                FakeField()
                Pill(stringResource(R.string.settings_school_preview_sign_in), color, AppColors.OnPrimary, Modifier.fillMaxWidth())
            }
            Column(
                Modifier.fillMaxWidth().background(AppColors.Surface, SHAPE).border(1.dp, AppColors.Border, SHAPE).padding(12.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp),
            ) {
                BrandRow(name, logo, color, null)
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                    Pill(stringResource(R.string.settings_school_preview_dashboard), color.copy(alpha = 0.1f), color)
                    Pill(stringResource(R.string.settings_school_preview_students), Color.Transparent, AppColors.TextSecondary)
                    Spacer(Modifier.weight(1f))
                    Pill(stringResource(R.string.settings_school_preview_save), color, AppColors.OnPrimary)
                }
            }
        }
    }
}

@Composable
private fun BrandRow(name: String, logo: String?, color: Color, subtitle: String?) {
    Row(horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.CenterVertically) {
        BrandMark(logoUrl = logo, color = color, size = 40.dp)
        Column {
            Text(name, style = MaterialTheme.typography.titleSmall, color = AppColors.TextPrimary, maxLines = 1, overflow = TextOverflow.Ellipsis)
            subtitle?.let { Text(it, style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary) }
        }
    }
}

@Composable
private fun FakeField() {
    Box(Modifier.fillMaxWidth().height(36.dp).border(1.dp, AppColors.Border, RoundedCornerShape(8.dp)))
}

@Composable
private fun Pill(text: String, background: Color, content: Color, modifier: Modifier = Modifier) {
    Box(
        modifier.background(background, RoundedCornerShape(8.dp)).padding(horizontal = 12.dp, vertical = 8.dp),
        contentAlignment = Alignment.Center,
    ) {
        Text(text, style = MaterialTheme.typography.labelLarge, color = content)
    }
}

private val SHAPE = RoundedCornerShape(12.dp)
