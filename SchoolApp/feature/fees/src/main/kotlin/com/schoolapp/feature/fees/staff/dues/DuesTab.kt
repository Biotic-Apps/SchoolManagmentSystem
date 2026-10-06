package com.schoolapp.feature.fees.staff.dues

import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.TaskAlt
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.MoneyRow
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SearchField
import com.schoolapp.core.designsystem.money.MoneyFormat
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.fees.R
import com.schoolapp.feature.fees.staff.dues.components.DuesRowCard

@Composable
internal fun DuesTab(
    state: DuesUiState,
    onSearchChange: (String) -> Unit,
    onRetry: () -> Unit,
    onRefresh: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val currency = MoneyFormat.DEFAULT_CURRENCY
    RefreshBox(state.isRefreshing, onRefresh, modifier.fillMaxSize()) {
        ScreenColumn(contentPadding = PaddingValues(start = 16.dp, top = 16.dp, end = 16.dp, bottom = 88.dp)) {
            item(key = "search") {
                SearchField(state.search, onSearchChange, placeholder = stringResource(R.string.fees_search_dues))
            }
            when {
                state.isLoading -> item(key = "loading") { LoadingState() }
                state.error != null -> item(key = "error") { ErrorState(appErrorMessage(state.error), onRetry = onRetry) }
                state.rows.isEmpty() -> item(key = "empty") {
                    EmptyState(stringResource(R.string.fees_no_dues), icon = Icons.Outlined.TaskAlt)
                }
                else -> {
                    item(key = "total") {
                        MoneyRow(
                            label = stringResource(R.string.fees_dues_total),
                            amountMinor = state.totalMinor,
                            currency = currency,
                            supporting = pluralStringResource(R.plurals.fees_student_count, state.rows.size, state.rows.size),
                            emphasized = true,
                        )
                    }
                    items(state.rows, key = { "due_${it.studentId}" }) { DuesRowCard(it, currency) }
                }
            }
        }
    }
}
