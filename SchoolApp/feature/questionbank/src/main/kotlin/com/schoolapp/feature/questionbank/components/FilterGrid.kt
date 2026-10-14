package com.schoolapp.feature.questionbank.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.runtime.Immutable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.CreatablePickerField
import com.schoolapp.core.designsystem.component.PickerOption
import com.schoolapp.core.designsystem.component.ScopePicker
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.feature.questionbank.common.SchoolOption

/** One "All …" filter dropdown. */
@Immutable
internal data class FilterSpec(
    val label: String,
    val allLabel: String,
    val options: List<PickerOption>,
    val selectedId: String?,
    val onSelect: (String?) -> Unit,
)

/** School switcher (only with several schools) above the filters, two per row. */
@Composable
internal fun FilterGrid(
    schools: List<SchoolOption>,
    schoolId: String?,
    onSchoolSelected: (String) -> Unit,
    filters: List<FilterSpec>,
    modifier: Modifier = Modifier,
) {
    Column(modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        if (schools.size > 1) {
            ScopePicker(
                options = schools.map { SwitcherOption(it.id, it.name) },
                selectedId = schoolId,
                onSelect = onSchoolSelected,
            )
        }
        filters.chunked(2).forEach { row ->
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                row.forEach { spec ->
                    CreatablePickerField(
                        label = spec.label,
                        options = spec.options,
                        selectedId = spec.selectedId,
                        onSelect = spec.onSelect,
                        noneLabel = spec.allLabel,
                        modifier = Modifier.weight(1f),
                    )
                }
                if (row.size == 1) Column(Modifier.weight(1f)) {}
            }
        }
    }
}
