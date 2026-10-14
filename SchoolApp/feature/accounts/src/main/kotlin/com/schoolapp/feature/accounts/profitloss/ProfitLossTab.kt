package com.schoolapp.feature.accounts.profitloss

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.ShowChart
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.FilterChipRow
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.ui.loadErrorMessage
import com.schoolapp.feature.accounts.R
import com.schoolapp.feature.accounts.common.DateRangeFields
import com.schoolapp.feature.accounts.common.RangePreset

internal class ProfitLossActions(
    val onPreset: (RangePreset) -> Unit,
    val onFrom: (String) -> Unit,
    val onTo: (String) -> Unit,
    val onRefresh: () -> Unit,
    val onRetry: () -> Unit,
)

/** Profit & Loss: range presets, From / To dates, summary tiles, income vs expenses bar and both line lists. */
@Composable
internal fun ProfitLossTab(state: ProfitLossUiState, actions: ProfitLossActions) {
    Column(Modifier.fillMaxSize()) {
        RangeControls(state, actions)
        val report = state.report
        when {
            !state.range.isValid -> EmptyState(
                title = stringResource(R.string.accounts_range_invalid),
                message = stringResource(R.string.accounts_range_invalid_message),
                icon = Icons.AutoMirrored.Outlined.ShowChart,
            )
            state.isLoading && report == null -> LoadingState()
            state.error != null && report == null -> ErrorState(loadErrorMessage(state.error), onRetry = actions.onRetry)
            report == null -> LoadingState()
            else -> RefreshBox(isRefreshing = state.isRefreshing || state.isLoading, onRefresh = actions.onRefresh) {
                ScreenColumn(contentPadding = PaddingValues(start = 16.dp, top = 8.dp, end = 16.dp, bottom = 16.dp)) {
                    state.error?.let { error -> item(key = "error") { InlineMessage(loadErrorMessage(error), StatusTone.Error) } }
                    item(key = "tiles") { ProfitLossTiles(report) }
                    item(key = "ratio") { IncomeExpenseBar(report) }
                    item(key = "lines") { ProfitLossSections(report) }
                }
            }
        }
    }
}

@Composable
private fun RangeControls(state: ProfitLossUiState, actions: ProfitLossActions) {
    Column(
        Modifier.fillMaxWidth().padding(start = 16.dp, top = 8.dp, end = 16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        FilterChipRow(
            options = listOf(
                SwitcherOption(RangePreset.THIS_MONTH.name, stringResource(R.string.accounts_preset_this_month)),
                SwitcherOption(RangePreset.LAST_MONTH.name, stringResource(R.string.accounts_preset_last_month)),
                SwitcherOption(RangePreset.THIS_YEAR.name, stringResource(R.string.accounts_preset_this_year)),
                SwitcherOption(RangePreset.CUSTOM.name, stringResource(R.string.accounts_preset_custom)),
            ),
            selectedId = state.preset.name,
            onSelect = { actions.onPreset(RangePreset.valueOf(it)) },
        )
        DateRangeFields(
            from = state.range.from,
            to = state.range.to,
            onFrom = actions.onFrom,
            onTo = actions.onTo,
            errorText = if (state.range.isValid) null else stringResource(R.string.accounts_range_invalid),
        )
    }
}
