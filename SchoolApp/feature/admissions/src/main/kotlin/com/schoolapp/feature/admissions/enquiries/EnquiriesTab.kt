package com.schoolapp.feature.admissions.enquiries

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material.icons.outlined.ContactPhone
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppFloatingButton
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.FilterChipRow
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.ListItemRow
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SearchField
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.designsystem.component.dataListItems
import com.schoolapp.core.model.admissions.EnquiryStatus
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.formatDate
import com.schoolapp.core.ui.humanizeKey
import com.schoolapp.core.ui.statusTone
import com.schoolapp.feature.admissions.R
import com.schoolapp.feature.admissions.common.NoticeToast

/** Walk-in / phone enquiries followed up until they apply. */
@Composable
internal fun EnquiriesTab(
    onOpenApplication: (String) -> Unit,
    modifier: Modifier = Modifier,
    viewModel: EnquiriesViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    NoticeToast(state.notice, viewModel::noticeShown)
    LaunchedEffect(state.convertedApplicationId) {
        state.convertedApplicationId?.let {
            viewModel.convertedOpened()
            onOpenApplication(it)
        }
    }
    Box(modifier.fillMaxSize()) {
        RefreshBox(isRefreshing = state.isRefreshing, onRefresh = viewModel::refresh, modifier = Modifier.fillMaxSize()) {
            ScreenColumn(
                contentPadding = PaddingValues(start = 16.dp, top = 16.dp, end = 16.dp, bottom = if (state.access.canAdd) 88.dp else 16.dp),
                itemSpacing = 0.dp,
            ) {
                when {
                    state.isLoading -> item(key = "loading") { LoadingState() }
                    state.error != null && state.enquiries.isEmpty() ->
                        item(key = "error") { ErrorState(appErrorMessage(state.error!!), onRetry = viewModel::load) }
                    else -> {
                        state.error?.let { item(key = "staleError") { InlineMessage(appErrorMessage(it), StatusTone.Error, Modifier.padding(bottom = 8.dp)) } }
                        item(key = "search") {
                            SearchField(state.query, viewModel::onQuery, Modifier.fillMaxWidth(), placeholder = stringResource(R.string.admissions_search_enquiries))
                        }
                        item(key = "filters") {
                            val counts = state.counts
                            val options = listOf(SwitcherOption(ALL, stringResource(R.string.admissions_all, state.enquiries.size))) +
                                EnquiryStatus.entries.filter { it != EnquiryStatus.UNKNOWN }.map { s ->
                                    SwitcherOption(s.name, stringResource(R.string.admissions_status_count, humanizeKey(s.name), counts[s] ?: 0))
                                }
                            FilterChipRow(
                                options = options,
                                selectedId = state.filter?.name ?: ALL,
                                onSelect = { id -> viewModel.onFilter(if (id == ALL) null else EnquiryStatus.valueOf(id)) },
                                modifier = Modifier.padding(vertical = 8.dp),
                            )
                        }
                        dataListItems(
                            items = state.visible,
                            key = { it.id },
                            emptyContent = {
                                EmptyState(
                                    stringResource(R.string.admissions_enquiries_empty),
                                    message = stringResource(R.string.admissions_enquiries_empty_hint),
                                    icon = Icons.Outlined.ContactPhone,
                                )
                            },
                        ) { enquiry ->
                            val followUp = formatDate(enquiry.followUpDate)?.let { stringResource(R.string.admissions_follow_up_on, it) }
                            ListItemRow(
                                title = enquiry.childName,
                                supporting = listOfNotNull(enquiry.className, enquiry.guardianName, enquiry.phone, followUp).joinToString(" · "),
                                leadingIcon = Icons.Outlined.ContactPhone,
                                onClick = { viewModel.open(EnquirySheet.Details(enquiry)) },
                                trailing = { StatusChip(humanizeKey(enquiry.status.name), statusTone(enquiry.status.name)) },
                            )
                        }
                    }
                }
            }
        }
        if (state.access.canAdd) {
            AppFloatingButton(
                text = stringResource(R.string.admissions_add_enquiry),
                icon = Icons.Outlined.Add,
                onClick = { viewModel.open(EnquirySheet.Add) },
                modifier = Modifier.align(Alignment.BottomEnd).padding(16.dp),
            )
        }
    }
    EnquirySheetHost(state, viewModel, onOpenApplication)
}

private const val ALL = "ALL"
