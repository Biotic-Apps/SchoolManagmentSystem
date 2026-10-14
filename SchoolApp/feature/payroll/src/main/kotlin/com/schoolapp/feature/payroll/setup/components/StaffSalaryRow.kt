package com.schoolapp.feature.payroll.setup.components

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.ListItemRow
import com.schoolapp.core.designsystem.component.PersonAvatar
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.money.MoneyFormat
import com.schoolapp.core.model.payroll.setup.PayrollStaff
import com.schoolapp.feature.payroll.R
import com.schoolapp.feature.payroll.setup.staffTypeLabel
import com.schoolapp.feature.payroll.setup.yearMonthLabel

/** A staff member with their gross salary and since when, or a "No salary" warning chip. */
@Composable
internal fun StaffSalaryRow(staff: PayrollStaff, onClick: () -> Unit, modifier: Modifier = Modifier) {
    val salary = staff.salary
    val type = staffTypeLabel(staff.designation)
    val detail = salary?.let {
        stringResource(R.string.payroll_setup_gross_from, MoneyFormat.format(it.grossMinor), yearMonthLabel(it.effectiveFrom))
    }
    AppCard(modifier.fillMaxWidth(), onClick = onClick, contentPadding = 4.dp) {
        ListItemRow(
            title = staff.name,
            supporting = listOfNotNull(type, staff.employeeNo, detail).joinToString(" · "),
            leading = { PersonAvatar(staff.name, null) },
            trailing = if (salary == null) {
                { StatusChip(stringResource(R.string.payroll_setup_no_salary), StatusTone.Warning) }
            } else {
                null
            },
        )
    }
}

