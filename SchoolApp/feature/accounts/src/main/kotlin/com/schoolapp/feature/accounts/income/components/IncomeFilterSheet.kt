package com.schoolapp.feature.accounts.income.components

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
import com.schoolapp.core.designsystem.component.CreatablePickerField
import com.schoolapp.core.designsystem.component.PickerOption
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.model.accounts.IncomeCategory
import com.schoolapp.core.model.accounts.IncomeFilter
import com.schoolapp.feature.accounts.R
import com.schoolapp.feature.accounts.common.DateRangeFields

/** Category and "received between" filters of the income list. */
@Composable
internal fun IncomeFilterSheet(
    filter: IncomeFilter,
    categories: List<IncomeCategory>,
    onApply: (IncomeFilter) -> Unit,
    onDismiss: () -> Unit,
) {
    var draft by remember { mutableStateOf(filter) }
    val invalid = draft.from != null && draft.to != null && draft.from!! > draft.to!!
    AppBottomSheet(title = stringResource(R.string.accounts_filters), onDismiss = onDismiss) {
        CreatablePickerField(
            label = stringResource(R.string.accounts_category),
            options = categories.map { PickerOption(it.id, it.name, it.code) },
            selectedId = draft.categoryId,
            onSelect = { draft = draft.copy(categoryId = it) },
            noneLabel = stringResource(R.string.accounts_all_categories),
            modifier = Modifier.fillMaxWidth(),
        )
        DateRangeFields(
            from = draft.from,
            to = draft.to,
            onFrom = { draft = draft.copy(from = it) },
            onTo = { draft = draft.copy(to = it) },
            errorText = if (invalid) stringResource(R.string.accounts_range_invalid) else null,
            emptyLabel = stringResource(R.string.accounts_any_date),
        )
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            SecondaryButton(
                text = stringResource(R.string.accounts_clear_filters),
                onClick = { onApply(IncomeFilter()) },
                modifier = Modifier.weight(1f),
            )
            PrimaryButton(
                text = stringResource(R.string.accounts_apply),
                onClick = { onApply(draft) },
                enabled = !invalid,
                modifier = Modifier.weight(1f),
            )
        }
    }
}
