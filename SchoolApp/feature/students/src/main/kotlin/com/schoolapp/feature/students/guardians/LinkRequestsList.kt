package com.schoolapp.feature.students.guardians

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Check
import androidx.compose.material.icons.outlined.Close
import androidx.compose.material.icons.outlined.Link
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.ListItemRow
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.people.ChildLinkRequest
import com.schoolapp.core.ui.actionErrorMessage
import com.schoolapp.core.ui.formatTimestamp
import com.schoolapp.core.ui.humanizeKey
import com.schoolapp.feature.students.R
import com.schoolapp.feature.students.components.sectionLabel
import com.schoolapp.feature.students.paging.LoadMoreOnScroll
import com.schoolapp.feature.students.paging.Paged
import com.schoolapp.feature.students.paging.pagedItems

/** Parents' "link my child" requests (OTP-verified), approved or rejected right here. */
@Composable
internal fun LinkRequestsList(
    state: GuardiansUiState,
    paged: Paged<ChildLinkRequest>,
    onRefresh: () -> Unit,
    onRetry: () -> Unit,
    onLoadMore: () -> Unit,
    onApprove: (ChildLinkRequest) -> Unit,
    onReject: (ChildLinkRequest) -> Unit,
    onDismissError: () -> Unit,
) {
    val listState = rememberLazyListState()
    LoadMoreOnScroll(listState, onLoadMore)
    RefreshBox(paged.isRefreshing, onRefresh) {
        ScreenColumn(itemSpacing = 0.dp, state = listState) {
            item(key = "hint") {
                InlineMessage(stringResource(R.string.students_link_requests_hint_decide), StatusTone.Info, Modifier.padding(bottom = 16.dp))
            }
            if (state.rejecting == null) {
                state.actionError?.let { error ->
                    item(key = "action_error") {
                        Column(Modifier.padding(bottom = 16.dp)) {
                            InlineMessage(actionErrorMessage(error.error, error.details), StatusTone.Error)
                            AppTextButton(stringResource(R.string.students_dismiss), onDismissError)
                        }
                    }
                }
            }
            pagedItems(
                paged = paged,
                key = { it.id },
                onRetry = onRetry,
                onLoadMore = onLoadMore,
                empty = { EmptyState(stringResource(R.string.students_link_requests_empty), icon = Icons.Outlined.Link) },
            ) { request ->
                LinkRequestRow(request, state.canDecide, request.id in state.deciding, onApprove, onReject)
            }
        }
    }
}

@Composable
private fun LinkRequestRow(
    request: ChildLinkRequest,
    canDecide: Boolean,
    deciding: Boolean,
    onApprove: (ChildLinkRequest) -> Unit,
    onReject: (ChildLinkRequest) -> Unit,
) {
    Column {
        ListItemRow(
            title = listOfNotNull(request.guardianName, request.studentName).joinToString(" → "),
            supporting = listOfNotNull(
                request.relation?.let(::humanizeKey),
                request.guardianPhone,
                sectionLabel(request.className, request.sectionName),
                request.admissionNo,
                formatTimestamp(request.createdAt),
            ).joinToString(" · "),
            leadingIcon = Icons.Outlined.Link,
            trailing = request.status?.let { { StatusChip(humanizeKey(it), StatusTone.Warning) } },
        )
        if (canDecide) {
            Row(
                Modifier.fillMaxWidth().padding(start = 16.dp, end = 16.dp, bottom = 12.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                SecondaryButton(
                    stringResource(R.string.students_reject), { onReject(request) }, Modifier.weight(1f),
                    enabled = !deciding, leadingIcon = Icons.Outlined.Close,
                )
                PrimaryButton(
                    stringResource(R.string.students_approve), { onApprove(request) }, Modifier.weight(1f),
                    loading = deciding, leadingIcon = Icons.Outlined.Check,
                )
            }
        }
    }
}
