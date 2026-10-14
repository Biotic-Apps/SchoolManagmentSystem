package com.schoolapp.feature.admissions.waiting

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.HourglassEmpty
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.ConfirmDialog
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.ListItemRow
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.dataListItems
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.formatDate
import com.schoolapp.feature.admissions.R
import com.schoolapp.feature.admissions.common.NoticeToast

@Composable
internal fun WaitingListTab(
    onOpenApplication: (String) -> Unit,
    modifier: Modifier = Modifier,
    viewModel: WaitingListViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    NoticeToast(state.notice, viewModel::noticeShown)
    RefreshBox(isRefreshing = state.isRefreshing, onRefresh = viewModel::refresh, modifier = modifier) {
        ScreenColumn(itemSpacing = 0.dp) {
            item(key = "hint") {
                Text(
                    stringResource(R.string.admissions_waiting_hint),
                    style = MaterialTheme.typography.bodyMedium,
                    color = AppColors.TextSecondary,
                    modifier = Modifier.padding(bottom = 12.dp),
                )
            }
            state.offerError?.let { item(key = "offerError") { InlineMessage(appErrorMessage(it), StatusTone.Error, Modifier.padding(bottom = 8.dp)) } }
            when {
                state.isLoading -> item(key = "loading") { LoadingState() }
                state.error != null && state.applications.isEmpty() ->
                    item(key = "error") { ErrorState(appErrorMessage(state.error!!), onRetry = viewModel::load) }
                else -> dataListItems(
                    items = state.applications,
                    key = { it.id },
                    emptyContent = {
                        EmptyState(
                            stringResource(R.string.admissions_waiting_empty),
                            message = stringResource(R.string.admissions_waiting_empty_hint),
                            icon = Icons.Outlined.HourglassEmpty,
                        )
                    },
                ) { app ->
                    val guardian = app.guardians.firstOrNull { it.isPrimary } ?: app.guardians.firstOrNull()
                    ListItemRow(
                        title = app.childName,
                        supporting = listOfNotNull(app.className, app.applicationNo, guardian?.phone, formatDate(app.createdAt)).joinToString(" · "),
                        leading = { Text("#${app.waitlistPosition ?: "—"}", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold) },
                        onClick = { onOpenApplication(app.id) },
                        trailing = if (state.canOffer) {
                            { AppTextButton(stringResource(R.string.admissions_offer_seat), { viewModel.askOffer(app) }) }
                        } else {
                            null
                        },
                    )
                }
            }
        }
    }
    state.offerTarget?.let { target ->
        ConfirmDialog(
            title = stringResource(R.string.admissions_offer_seat_title, target.childName),
            message = stringResource(R.string.admissions_offer_seat_message),
            confirmLabel = stringResource(R.string.admissions_offer_seat),
            onConfirm = viewModel::confirmOffer,
            onDismiss = viewModel::dismissOffer,
        )
    }
}
