package com.schoolapp.feature.fees.staff.structure.form

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material.icons.outlined.Close
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.CreatablePickerField
import com.schoolapp.core.designsystem.component.MoneyField
import com.schoolapp.core.designsystem.component.NumberStepper
import com.schoolapp.core.designsystem.component.PickerOption
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.fees.structure.FeeFrequency
import com.schoolapp.core.model.fees.structure.FeeHead
import com.schoolapp.feature.fees.R
import com.schoolapp.feature.fees.staff.structure.frequencyLabel

/** Rows of fee head, amount, frequency and due day; add and remove. */
@Composable
internal fun PlanItemsEditor(
    form: FeePlanForm,
    heads: List<FeeHead>,
    issues: PlanIssues,
    enabled: Boolean,
    onEdit: ((FeePlanForm) -> FeePlanForm) -> Unit,
) {
    val headOptions = heads.map { PickerOption(it.id, it.name, it.code) }
    val frequencyOptions = FeeFrequency.entries.map { PickerOption(it.name, frequencyLabel(it)) }
    fun update(key: Int, change: (PlanItemRow) -> PlanItemRow) =
        onEdit { f -> f.copy(items = f.items.map { if (it.key == key) change(it) else it }) }
    Column(Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Text(stringResource(R.string.fees_st_plan_items), style = MaterialTheme.typography.titleSmall, color = AppColors.TextPrimary)
        if (issues.noItems) Text(stringResource(R.string.fees_st_plan_items_required), style = MaterialTheme.typography.bodySmall, color = AppColors.Error)
        form.items.forEach { row ->
            val problems = issues.items[row.key].orEmpty()
            AppCard(Modifier.fillMaxWidth(), verticalSpacing = 8.dp, contentPadding = 12.dp) {
                Row(verticalAlignment = Alignment.Top) {
                    CreatablePickerField(
                        label = stringResource(R.string.fees_st_item_head),
                        options = headOptions,
                        selectedId = row.feeHeadId,
                        onSelect = { id -> update(row.key) { it.copy(feeHeadId = id) } },
                        enabled = enabled,
                        errorText = when {
                            ItemIssue.HEAD_REQUIRED in problems -> stringResource(R.string.fees_st_item_head_required)
                            ItemIssue.HEAD_DUPLICATE in problems -> stringResource(R.string.fees_st_item_head_duplicate)
                            else -> null
                        },
                        modifier = Modifier.weight(1f),
                    )
                    IconButton(onClick = { onEdit { f -> f.copy(items = f.items.filterNot { it.key == row.key }) } }, enabled = enabled) {
                        Icon(Icons.Outlined.Close, stringResource(R.string.fees_st_remove), tint = AppColors.TextSecondary)
                    }
                }
                MoneyField(
                    value = row.amount,
                    onValueChange = { text -> update(row.key) { it.copy(amount = text) } },
                    label = stringResource(R.string.fees_st_item_amount),
                    errorText = if (ItemIssue.AMOUNT in problems) stringResource(R.string.fees_st_item_amount_invalid) else null,
                    enabled = enabled,
                )
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    CreatablePickerField(
                        label = stringResource(R.string.fees_st_item_frequency),
                        options = frequencyOptions,
                        selectedId = row.frequency.name,
                        onSelect = { id -> id?.let { value -> update(row.key) { it.copy(frequency = FeeFrequency.valueOf(value)) } } },
                        enabled = enabled,
                        modifier = Modifier.weight(1f),
                    )
                    NumberStepper(
                        value = row.dueDay,
                        onValueChange = { day -> update(row.key) { it.copy(dueDay = day) } },
                        label = stringResource(R.string.fees_st_item_due_day),
                        min = 1,
                        max = 28,
                        enabled = enabled,
                        modifier = Modifier.weight(1f),
                    )
                }
            }
        }
        AppTextButton(
            stringResource(R.string.fees_st_add_item),
            { onEdit { it.copy(items = it.items + PlanItemRow(it.nextKey), nextKey = it.nextKey + 1) } },
            enabled = enabled,
            leadingIcon = Icons.Outlined.Add,
        )
    }
}
