package com.schoolapp.feature.exams.grading.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material.icons.outlined.AutoFixHigh
import androidx.compose.material.icons.outlined.DeleteOutline
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.FieldKind
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.exams.R
import com.schoolapp.feature.exams.grading.BandInput
import com.schoolapp.feature.exams.grading.BandIssue
import com.schoolapp.feature.exams.grading.CoverageIssue
import com.schoolapp.feature.exams.grading.GradingForm
import com.schoolapp.feature.exams.grading.GradingFormActions

@Composable
internal fun GradingSchemeSheet(form: GradingForm, actions: GradingFormActions, onSave: () -> Unit) {
    val title = stringResource(if (form.schemeId == null) R.string.exams_grading_new_title else R.string.exams_grading_edit_title)
    AppBottomSheet(title = title, onDismiss = actions::dismiss) {
        form.error?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
        AppTextField(
            value = form.name,
            onValueChange = actions::onName,
            label = stringResource(R.string.exams_grading_name),
            errorText = if (form.nameMissing) stringResource(R.string.exams_grading_name_required) else null,
        )
        AppTextField(
            value = form.passPercent,
            onValueChange = actions::onPass,
            label = stringResource(R.string.exams_grading_pass),
            kind = FieldKind.Number,
            errorText = if (form.passInvalid) stringResource(R.string.exams_grading_pass_invalid) else null,
        )
        SectionHeader(
            title = stringResource(R.string.exams_grading_bands),
            action = { AppTextButton(stringResource(R.string.exams_grading_standard), actions::useStandard, leadingIcon = Icons.Outlined.AutoFixHigh) },
        )
        form.coverage.forEach { InlineMessage(stringResource(coverageText(it)), StatusTone.Error) }
        form.bands.forEach { band -> BandEditor(band, form.bandIssues[band.key], form.bands.size > 1, actions) }
        AppTextButton(stringResource(R.string.exams_grading_add_band), actions::addBand, leadingIcon = Icons.Outlined.Add)
        PrimaryButton(stringResource(R.string.exams_grading_save), onSave, Modifier.fillMaxWidth(), loading = form.isSaving)
    }
}

@Composable
private fun BandEditor(band: BandInput, issue: BandIssue?, removable: Boolean, actions: GradingFormActions) {
    AppCard(verticalSpacing = 8.dp, tone = if (issue != null) StatusTone.Error else null) {
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
            AppTextField(
                value = band.grade,
                onValueChange = { v -> actions.updateBand(band.key) { it.copy(grade = v.take(GRADE_MAX)) } },
                label = stringResource(R.string.exams_grading_grade),
                modifier = Modifier.weight(1f),
            )
            AppTextField(
                value = band.min,
                onValueChange = { v -> actions.updateBand(band.key) { it.copy(min = v.filter(Char::isDigit).take(3)) } },
                label = stringResource(R.string.exams_grading_min),
                kind = FieldKind.Number,
                modifier = Modifier.weight(1f),
            )
            AppTextField(
                value = band.max,
                onValueChange = { v -> actions.updateBand(band.key) { it.copy(max = v.filter(Char::isDigit).take(3)) } },
                label = stringResource(R.string.exams_grading_max),
                kind = FieldKind.Number,
                modifier = Modifier.weight(1f),
            )
            if (removable) {
                IconButton(onClick = { actions.removeBand(band.key) }) {
                    Icon(Icons.Outlined.DeleteOutline, contentDescription = stringResource(R.string.exams_grading_remove_band), tint = AppColors.Error)
                }
            }
        }
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            AppTextField(
                value = band.remark,
                onValueChange = { v -> actions.updateBand(band.key) { it.copy(remark = v.take(REMARK_MAX)) } },
                label = stringResource(R.string.exams_grading_remark),
                modifier = Modifier.weight(2f),
            )
            AppTextField(
                value = band.gradePoint,
                onValueChange = { v -> actions.updateBand(band.key) { it.copy(gradePoint = v.filter { c -> c.isDigit() || c == '.' }.take(5)) } },
                label = stringResource(R.string.exams_grading_point),
                kind = FieldKind.Decimal,
                modifier = Modifier.weight(1f),
            )
        }
        issue?.let { Text(stringResource(issueText(it)), style = MaterialTheme.typography.bodySmall, color = AppColors.Error) }
    }
}

private fun issueText(issue: BandIssue): Int = when (issue) {
    BandIssue.GRADE_MISSING -> R.string.exams_band_grade_missing
    BandIssue.GRADE_REPEATED -> R.string.exams_band_grade_repeated
    BandIssue.RANGE_INVALID -> R.string.exams_band_range_invalid
    BandIssue.OVERLAP -> R.string.exams_band_overlap
    BandIssue.GAP -> R.string.exams_band_gap
    BandIssue.POINT_INVALID -> R.string.exams_band_point_invalid
}

private fun coverageText(issue: CoverageIssue): Int = when (issue) {
    CoverageIssue.NO_BANDS -> R.string.exams_band_no_bands
    CoverageIssue.NOT_FROM_ZERO -> R.string.exams_band_from_zero
    CoverageIssue.NOT_TO_HUNDRED -> R.string.exams_band_to_hundred
}

private const val GRADE_MAX = 10
private const val REMARK_MAX = 60
