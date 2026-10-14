package com.schoolapp.feature.fees.staff.invoices

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.CreatablePickerField
import com.schoolapp.core.designsystem.component.FilterChipRow
import com.schoolapp.core.designsystem.component.PickerOption
import com.schoolapp.core.designsystem.component.SearchField
import com.schoolapp.core.designsystem.component.SwitchRow
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.model.fees.InvoiceStatus
import com.schoolapp.feature.fees.R
import com.schoolapp.feature.fees.components.MonthStepper
import com.schoolapp.feature.fees.components.label
import java.time.YearMonth

/** Search, status chips, class and (optionally) one month. */
@Composable
internal fun InvoiceFilters(state: InvoicesUiState, viewModel: InvoicesViewModel, modifier: Modifier = Modifier) {
    val filter = state.filter
    Column(modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        SearchField(state.search, viewModel::onSearch, placeholder = stringResource(R.string.fees_inv_search))
        FilterChipRow(
            options = listOf(SwitcherOption(ALL, stringResource(R.string.fees_inv_all_status))) +
                InvoiceStatus.entries.map { SwitcherOption(it.name, it.label()) },
            selectedId = filter.status?.name ?: ALL,
            onSelect = { id -> viewModel.onStatus(InvoiceStatus.entries.firstOrNull { it.name == id }) },
        )
        CreatablePickerField(
            label = stringResource(R.string.fees_inv_class),
            options = state.classes.map { PickerOption(it.id, it.name) },
            selectedId = filter.classId,
            onSelect = viewModel::onClass,
            noneLabel = stringResource(R.string.fees_inv_all_classes),
            fallbackValue = stringResource(R.string.fees_inv_all_classes),
        )
        val period = filter.period?.let { runCatching { YearMonth.parse(it) }.getOrNull() }
        SwitchRow(
            title = stringResource(R.string.fees_inv_filter_month),
            checked = period != null,
            onCheckedChange = { on -> viewModel.onPeriod(if (on) state.currentMonth else null) },
            supporting = if (period == null) stringResource(R.string.fees_inv_any_month) else null,
        )
        period?.let { MonthStepper(it, viewModel::onPeriod) }
    }
}

private const val ALL = "ALL"
