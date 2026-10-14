package com.schoolapp.feature.students.list

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.CreatablePickerField
import com.schoolapp.core.designsystem.component.FilterChipRow
import com.schoolapp.core.designsystem.component.PickerOption
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.model.students.list.StudentListFilter
import com.schoolapp.core.ui.humanizeKey
import com.schoolapp.feature.students.R

/** Class and section pickers (section once a class is chosen) and status chips (Active by default). */
@Composable
internal fun StudentFilters(state: StudentsListUiState, actions: StudentsTabActions, modifier: Modifier = Modifier) {
    val filter = state.filter
    Column(modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            CreatablePickerField(
                label = stringResource(R.string.students_filter_class),
                options = state.classes.map { (id, name) -> PickerOption(id, name) },
                selectedId = filter.classId,
                onSelect = actions.onClass,
                noneLabel = stringResource(R.string.students_all_classes),
                enabled = !state.scopeLoading,
                modifier = Modifier.weight(1f),
            )
            if (filter.classId != null) {
                CreatablePickerField(
                    label = stringResource(R.string.students_filter_section),
                    options = state.classSections.map { PickerOption(it.id, it.label) },
                    selectedId = filter.sectionId,
                    onSelect = actions.onSection,
                    noneLabel = stringResource(R.string.students_all_sections),
                    modifier = Modifier.weight(1f),
                )
            }
        }
        FilterChipRow(
            options = listOf(SwitcherOption(ALL, stringResource(R.string.students_all_statuses))) +
                StudentListFilter.STATUSES.map { SwitcherOption(it, humanizeKey(it)) },
            selectedId = filter.status ?: ALL,
            onSelect = { actions.onStatus(it.takeUnless { id -> id == ALL }) },
        )
    }
}

private const val ALL = "all"
