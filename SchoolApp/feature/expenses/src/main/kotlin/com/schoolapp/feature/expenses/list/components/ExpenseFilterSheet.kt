package com.schoolapp.feature.expenses.list.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.AppDatePickerDialog
import com.schoolapp.core.designsystem.component.CreatablePickerField
import com.schoolapp.core.designsystem.component.PickerField
import com.schoolapp.core.designsystem.component.PickerOption
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.model.expenses.ExpenseCategory
import com.schoolapp.core.ui.formatDate
import com.schoolapp.feature.expenses.R
import com.schoolapp.feature.expenses.list.ExpenseFilters

private enum class DateTarget { FROM, TO }

/** Category and bill-date range filters; edits a copy and applies on "Apply". */
@Composable
internal fun ExpenseFilterSheet(
    filters: ExpenseFilters,
    categories: List<ExpenseCategory>,
    onApply: (ExpenseFilters) -> Unit,
    onDismiss: () -> Unit,
) {
    var draft by remember(filters) { mutableStateOf(filters) }
    var picking by remember { mutableStateOf<DateTarget?>(null) }
    val any = stringResource(R.string.expenses_any_date)
    AppBottomSheet(title = stringResource(R.string.expenses_filters_title), onDismiss = onDismiss) {
        CreatablePickerField(
            label = stringResource(R.string.expenses_field_category),
            options = categories.map { PickerOption(it.id, it.name, it.code) },
            selectedId = draft.categoryId,
            onSelect = { draft = draft.copy(categoryId = it) },
            noneLabel = stringResource(R.string.expenses_all_categories),
            modifier = Modifier.fillMaxWidth(),
        )
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            PickerField(
                value = formatDate(draft.from) ?: any,
                label = stringResource(R.string.expenses_filter_from),
                onClick = { picking = DateTarget.FROM },
                modifier = Modifier.weight(1f),
            )
            PickerField(
                value = formatDate(draft.to) ?: any,
                label = stringResource(R.string.expenses_filter_to),
                onClick = { picking = DateTarget.TO },
                modifier = Modifier.weight(1f),
            )
        }
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            SecondaryButton(
                text = stringResource(R.string.expenses_reset),
                onClick = { onApply(ExpenseFilters(status = filters.status)) },
                modifier = Modifier.weight(1f),
            )
            PrimaryButton(
                text = stringResource(R.string.expenses_apply),
                onClick = { onApply(draft) },
                modifier = Modifier.weight(1f),
            )
        }
    }
    picking?.let { target ->
        AppDatePickerDialog(
            initialDate = if (target == DateTarget.FROM) draft.from else draft.to,
            onConfirm = { date ->
                draft = if (target == DateTarget.FROM) draft.copy(from = date) else draft.copy(to = date)
                picking = null
            },
            onDismiss = { picking = null },
            minDate = if (target == DateTarget.TO) draft.from else null,
            maxDate = if (target == DateTarget.FROM) draft.to else null,
        )
    }
}
