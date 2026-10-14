package com.schoolapp.feature.payroll.setup.detail

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
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.MoneyField
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.feature.payroll.R

/** Named amounts (allowances or deductions) with add / remove; problems show under each field. */
@Composable
internal fun SalaryItemsEditor(
    title: String,
    addLabel: String,
    rows: List<ItemRow>,
    problems: Map<Int, Set<ItemProblem>>,
    enabled: Boolean,
    onChange: (List<ItemRow>) -> Unit,
    onAdd: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Text(title, style = MaterialTheme.typography.titleSmall, color = AppColors.TextPrimary)
        rows.forEach { row ->
            val issues = problems[row.key].orEmpty()
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.Top) {
                AppTextField(
                    value = row.name,
                    onValueChange = { name -> onChange(rows.map { if (it.key == row.key) it.copy(name = name) else it }) },
                    label = stringResource(R.string.payroll_setup_item_name),
                    errorText = when {
                        ItemProblem.NAME_REQUIRED in issues -> stringResource(R.string.payroll_setup_required)
                        ItemProblem.NAME_TOO_LONG in issues -> stringResource(R.string.payroll_setup_name_too_long)
                        else -> null
                    },
                    enabled = enabled,
                    modifier = Modifier.weight(1.2f),
                )
                MoneyField(
                    value = row.amount,
                    onValueChange = { amount -> onChange(rows.map { if (it.key == row.key) it.copy(amount = amount) else it }) },
                    label = stringResource(R.string.payroll_setup_item_amount),
                    errorText = if (ItemProblem.AMOUNT_INVALID in issues) stringResource(R.string.payroll_setup_amount_invalid) else null,
                    enabled = enabled,
                    modifier = Modifier.weight(1f),
                )
                IconButton(onClick = { onChange(rows.filterNot { it.key == row.key }) }, enabled = enabled) {
                    Icon(Icons.Outlined.Close, stringResource(R.string.payroll_setup_remove_item), tint = AppColors.TextSecondary)
                }
            }
        }
        AppTextButton(addLabel, onAdd, enabled = enabled, leadingIcon = Icons.Outlined.Add)
    }
}
