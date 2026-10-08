package com.schoolapp.feature.organisation.setup.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.ContentCopy
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.CreatablePickerField
import com.schoolapp.core.designsystem.component.PickerOption
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.academics.ClassSetup
import com.schoolapp.core.model.academics.ClassSubject
import com.schoolapp.feature.organisation.R
import com.schoolapp.feature.organisation.setup.AllocationController
import com.schoolapp.feature.organisation.setup.ClassSetupUiState

/** One card per subject with a teacher picker per section; "Same for all" copies the first chosen teacher. */
@Composable
internal fun TeachersCard(state: ClassSetupUiState, controller: AllocationController) {
    val setup = state.setup ?: return
    val left = setup.unallocated
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        SectionHeader(
            title = stringResource(R.string.org_setup_teachers),
            subtitle = if (left > 0) pluralStringResource(R.plurals.org_left_to_assign, left, left) else stringResource(R.string.org_all_assigned),
        )
        if (setup.sections.isEmpty() || setup.subjects.isEmpty()) {
            Text(stringResource(R.string.org_teachers_need), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
            return@Column
        }
        val preferred = setup.allocation.mapNotNull { it.staff?.id }.toSet()
        val options = teacherOptions(state.staff, preferred)
        setup.subjects.forEach { subject ->
            SubjectTeachers(setup, subject, options, state, controller)
        }
    }
}

@Composable
private fun SubjectTeachers(
    setup: ClassSetup,
    subject: ClassSubject,
    options: List<PickerOption>,
    state: ClassSetupUiState,
    controller: AllocationController,
) {
    val sections = setup.sectionsFor(subject)
    AppCard(Modifier.fillMaxWidth()) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(
                listOfNotNull(subject.name, subject.group).joinToString(" · "),
                style = MaterialTheme.typography.titleMedium,
                modifier = Modifier.weight(1f),
            )
            val hasSource = sections.any { setup.cell(it.id, subject.subjectId)?.staff != null }
            if (state.rights.allocate && sections.size > 1) {
                AppTextButton(
                    stringResource(R.string.org_same_for_all),
                    onClick = { controller.sameForAll(subject.subjectId) },
                    enabled = hasSource,
                    loading = state.fillingSubjectId == subject.subjectId,
                    leadingIcon = Icons.Outlined.ContentCopy,
                )
            }
        }
        if (sections.isEmpty()) {
            Text(stringResource(R.string.org_no_group_sections), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
        }
        sections.forEach { section ->
            val cell = setup.cell(section.id, subject.subjectId)
            CreatablePickerField(
                label = stringResource(R.string.org_section_teacher, section.name),
                options = options,
                selectedId = cell?.staff?.id,
                onSelect = { controller.setTeacher(section.id, subject.subjectId, it) },
                noneLabel = stringResource(R.string.org_no_teacher),
                enabled = state.rights.allocate,
                fallbackValue = cell?.staff?.name,
                errorText = if (cell?.staff == null) stringResource(R.string.org_needs_teacher) else null,
            )
        }
    }
}
