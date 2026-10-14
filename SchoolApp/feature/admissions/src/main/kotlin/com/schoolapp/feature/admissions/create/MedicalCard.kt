package com.schoolapp.feature.admissions.create

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppTextArea
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.feature.admissions.R

/** Optional allergies, conditions and notes for staff. */
@Composable
internal fun MedicalCard(form: MedicalForm, onChange: (MedicalForm) -> Unit, modifier: Modifier = Modifier) {
    AppCard(modifier.fillMaxWidth()) {
        SectionHeader(title = stringResource(R.string.admissions_medical), subtitle = stringResource(R.string.admissions_medical_hint))
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            AppTextArea(form.allergies, { onChange(form.copy(allergies = it)) }, stringResource(R.string.admissions_allergies), minLines = 1, maxLines = 4)
            AppTextArea(form.conditions, { onChange(form.copy(conditions = it)) }, stringResource(R.string.admissions_conditions), minLines = 1, maxLines = 4)
            AppTextArea(form.notes, { onChange(form.copy(notes = it)) }, stringResource(R.string.admissions_medical_notes), minLines = 1, maxLines = 4)
        }
    }
}
