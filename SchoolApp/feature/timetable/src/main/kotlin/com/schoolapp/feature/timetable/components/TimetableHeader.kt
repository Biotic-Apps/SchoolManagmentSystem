package com.schoolapp.feature.timetable.components

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Edit
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.FilterChipRow
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.feature.timetable.R
import com.schoolapp.feature.timetable.TeacherView
import com.schoolapp.feature.timetable.TimetableUiState

/** Teacher view switch, section chips, "Edit draft" and subtitle; scrolls away with the timetable body. */
@Composable
internal fun TimetableHeader(
    state: TimetableUiState,
    onTeacherViewSelected: (TeacherView) -> Unit,
    onSectionSelected: (String) -> Unit,
    onEditSection: ((sectionId: String, title: String) -> Unit)?,
) {
    Column {
        state.teacherView?.let {
            TeacherViewSwitch(it, onTeacherViewSelected, Modifier.padding(horizontal = 16.dp, vertical = 8.dp))
        }
        if (state.showsSections && state.sections.isNotEmpty()) {
            FilterChipRow(
                options = state.sections,
                selectedId = state.selectedSectionId,
                onSelect = onSectionSelected,
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp),
            )
        }
        val editable = state.selectedSectionId?.takeIf { state.teacherView == TeacherView.SECTIONS && state.sectionEditable }
        if (editable != null && onEditSection != null) {
            val title = state.sections.firstOrNull { it.id == editable }?.label.orEmpty()
            AppTextButton(
                text = stringResource(R.string.tt_edit_draft),
                onClick = { onEditSection(editable, title) },
                leadingIcon = Icons.Outlined.Edit,
                modifier = Modifier.padding(horizontal = 8.dp),
            )
        }
        state.subtitle?.takeIf { !state.showsSections }?.let {
            Text(it, style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary, modifier = Modifier.padding(16.dp, 4.dp))
        }
    }
}
