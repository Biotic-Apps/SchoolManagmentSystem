package com.schoolapp.feature.exams.manage.form

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.feature.exams.R

/** Multi-select chips of the school's classes, with select all / clear. */
@OptIn(ExperimentalLayoutApi::class)
@Composable
internal fun ClassChecklist(form: ExamFormState, enabled: Boolean, onToggle: (String) -> Unit, onSetAll: (Boolean) -> Unit) {
    val allSelected = form.classes.isNotEmpty() && form.classes.all { it.id in form.classIds }
    SectionHeader(
        title = stringResource(R.string.exams_form_classes),
        action = {
            AppTextButton(
                text = stringResource(if (allSelected) R.string.exams_form_clear_all else R.string.exams_form_select_all),
                onClick = { onSetAll(!allSelected) },
                enabled = enabled,
            )
        },
    )
    FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        form.classes.forEach { item ->
            FilterChip(
                selected = item.id in form.classIds,
                onClick = { onToggle(item.id) },
                label = { Text(item.name) },
                enabled = enabled,
            )
        }
    }
}
