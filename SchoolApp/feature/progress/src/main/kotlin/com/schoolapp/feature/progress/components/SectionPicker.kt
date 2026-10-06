package com.schoolapp.feature.progress.components

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.FilterChipRow
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.model.organisation.Section
import com.schoolapp.feature.progress.R

/** "Class 5-A" chips for the teacher's scoped sections. */
@Composable
internal fun SectionPicker(
    sections: List<Section>,
    selectedId: String?,
    onSelect: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    FilterChipRow(
        options = sections.map { SwitcherOption(it.id, sectionLabel(it)) },
        selectedId = selectedId,
        onSelect = onSelect,
        modifier = modifier,
    )
}

@Composable
internal fun sectionLabel(section: Section): String =
    section.className?.let { stringResource(R.string.progress_section_label, it, section.name) } ?: section.name
