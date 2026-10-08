package com.schoolapp.feature.organisation.setup.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.wrapContentSize
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material.icons.outlined.Delete
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
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
import com.schoolapp.core.designsystem.component.FilterChipRow
import com.schoolapp.core.designsystem.component.NumberStepper
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.academics.SetupSection
import com.schoolapp.feature.organisation.R
import com.schoolapp.feature.organisation.setup.ClassSetupUiState
import com.schoolapp.feature.organisation.setup.SectionsController

/** Sections of the class: seats, room (+ New room), group, class teacher; add and remove. */
@Composable
internal fun SectionsCard(state: ClassSetupUiState, controller: SectionsController, onRevealGroups: () -> Unit) {
    val rights = state.rights
    AppCard(Modifier.fillMaxWidth()) {
        SectionHeader(
            title = stringResource(R.string.org_setup_sections),
            subtitle = stringResource(R.string.org_setup_sections_hint),
            action = if (rights.editStructure && !state.showGroups) {
                { AppTextButton(stringResource(R.string.org_use_groups), onClick = onRevealGroups) }
            } else {
                null
            },
        )
        if (state.sections.isEmpty()) {
            Text(stringResource(R.string.org_setup_no_sections), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
        }
        val teachers = teacherOptions(state.staff)
        state.sections.forEachIndexed { index, section ->
            if (index > 0) HorizontalDivider(color = AppColors.Border, modifier = Modifier.padding(vertical = 4.dp))
            SectionEditor(section, state, controller, teachers)
        }
        if (rights.addSection) {
            SecondaryButton(
                stringResource(R.string.org_add_section),
                onClick = controller::add,
                loading = state.addingSection,
                leadingIcon = Icons.Outlined.Add,
            )
        }
    }
}

@Composable
private fun SectionEditor(
    section: SetupSection,
    state: ClassSetupUiState,
    controller: SectionsController,
    teachers: List<com.schoolapp.core.designsystem.component.PickerOption>,
) {
    val edit = state.rights.editStructure
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(
                section.name,
                style = MaterialTheme.typography.titleMedium,
                color = AppColors.OnSelected,
                modifier = Modifier.size(36.dp).background(AppColors.Selected, CircleShape).wrapContentSize(),
            )
            Spacer(Modifier.size(12.dp))
            Text(
                listOfNotNull(section.group, pluralStringResource(R.plurals.org_section_students, section.studentCount, section.studentCount))
                    .joinToString(" · "),
                style = MaterialTheme.typography.bodyMedium,
                color = AppColors.TextSecondary,
                modifier = Modifier.weight(1f),
            )
            if (state.rights.removeSection) {
                IconButton(onClick = { controller.askRemove(section) }) {
                    Icon(Icons.Outlined.Delete, contentDescription = stringResource(R.string.org_remove_section, section.name), tint = AppColors.TextSecondary)
                }
            }
        }
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(stringResource(R.string.org_seats), style = MaterialTheme.typography.bodyMedium, modifier = Modifier.weight(1f))
            NumberStepper(
                value = section.capacity,
                onValueChange = { controller.setSeats(section.id, it) },
                label = stringResource(R.string.org_seats_of, section.name),
                min = 1,
                max = MAX_SEATS,
                enabled = edit,
            )
        }
        CreatablePickerField(
            label = stringResource(R.string.org_room),
            options = roomOptions(state.rooms),
            selectedId = section.room?.id,
            onSelect = { controller.setRoom(section.id, it) },
            noneLabel = stringResource(R.string.org_no_room),
            onCreate = if (state.rights.createRoom) { name -> controller.createRoom(section.id, name) } else null,
            createLabel = { stringResource(R.string.org_new_room_named, it) },
            enabled = edit,
            fallbackValue = section.room?.name,
        )
        if (state.showGroups) {
            val none = stringResource(R.string.org_no_group)
            FilterChipRow(
                options = listOf(SwitcherOption(NO_GROUP, none)) + state.groupOptions.map { SwitcherOption(it, it) },
                selectedId = section.group ?: NO_GROUP,
                onSelect = { if (edit) controller.setGroup(section.id, it.takeIf { g -> g != NO_GROUP }) },
            )
        }
        CreatablePickerField(
            label = stringResource(R.string.org_class_teacher),
            options = teachers,
            selectedId = section.classTeacher?.id,
            onSelect = { controller.setClassTeacher(section.id, it) },
            noneLabel = stringResource(R.string.org_no_class_teacher),
            enabled = state.rights.allocate,
            fallbackValue = section.classTeacher?.name,
        )
    }
}

private const val NO_GROUP = "__none__"
private const val MAX_SEATS = 200
