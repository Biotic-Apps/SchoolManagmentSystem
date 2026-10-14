package com.schoolapp.feature.settings.school

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppTextArea
import com.schoolapp.core.designsystem.component.KeyValueRow
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.model.settings.SchoolSettings
import com.schoolapp.feature.settings.R

/** Receipt and report card footers with a character counter. */
@Composable
internal fun FooterSection(
    form: SchoolForm,
    canEdit: Boolean,
    serverErrors: Map<String, String>,
    onEdit: ((SchoolForm) -> SchoolForm) -> Unit,
) {
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        SectionHeader(title = stringResource(R.string.settings_school_footers))
        AppTextArea(
            value = form.receiptFooter,
            onValueChange = { value -> if (value.length <= FOOTER_MAX) onEdit { it.copy(receiptFooter = value) } },
            label = stringResource(R.string.settings_school_receipt_footer),
            enabled = canEdit,
            errorText = serverErrors["receiptFooter"],
            supportingText = stringResource(R.string.settings_school_receipt_footer_hint, form.receiptFooter.length, FOOTER_MAX),
        )
        AppTextArea(
            value = form.reportCardFooter,
            onValueChange = { value -> if (value.length <= FOOTER_MAX) onEdit { it.copy(reportCardFooter = value) } },
            label = stringResource(R.string.settings_school_report_footer),
            enabled = canEdit,
            errorText = serverErrors["reportCardFooter"],
            supportingText = stringResource(R.string.settings_school_report_footer_hint, form.reportCardFooter.length, FOOTER_MAX),
        )
    }
}

/** Time zone, currency and locale are fixed for the school. */
@Composable
internal fun RegionalSection(settings: SchoolSettings) {
    val dash = stringResource(R.string.settings_dash)
    Column {
        SectionHeader(
            title = stringResource(R.string.settings_school_regional),
            subtitle = stringResource(R.string.settings_school_regional_hint),
        )
        KeyValueRow(stringResource(R.string.settings_school_timezone), settings.timezone ?: dash)
        KeyValueRow(stringResource(R.string.settings_school_currency), settings.currency ?: dash)
        KeyValueRow(stringResource(R.string.settings_school_locale), settings.locale ?: dash)
    }
}

private const val FOOTER_MAX = 300
