package com.schoolapp.feature.exams.entry

import androidx.compose.foundation.lazy.LazyListState
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Groups
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.withFrameNanos
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.ImeAction
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.exams.R
import com.schoolapp.feature.exams.components.MarkValueRow
import com.schoolapp.feature.exams.components.SheetHeader
import com.schoolapp.feature.exams.components.SheetList
import com.schoolapp.feature.exams.entry.components.MarkEntryRow
import com.schoolapp.feature.exams.entry.components.marksBanners
import kotlinx.coroutines.launch

/** Callbacks of the marks body, grouped to keep the signature readable. */
internal class MarksEntryActions(
    val onRetry: () -> Unit,
    val onMarksChange: (String, String) -> Unit,
    val onAbsentChange: (String, Boolean) -> Unit,
    val onDiscardLocal: () -> Unit,
    val onScrollHandled: () -> Unit,
)

@Composable
internal fun MarksEntryScreen(state: MarksEntryUiState, actions: MarksEntryActions, modifier: Modifier = Modifier) {
    val sheet = state.sheet
    when {
        state.isLoading -> LoadingState(modifier)
        sheet == null -> ErrorState(state.error?.let { appErrorMessage(it) } ?: stringResource(R.string.exams_sheet_unavailable), modifier, onRetry = actions.onRetry)
        else -> {
            val listState = rememberLazyListState()
            val rows = state.rows
            val counts = state.counts
            val editable = !state.isReadOnly
            val requesters = remember { mutableMapOf<String, FocusRequester>() }
            val focusManager = LocalFocusManager.current
            val scope = rememberCoroutineScope()
            // Rows are the last items of the list, so a row's list index is derived from the end.
            val indexOf = { id: String -> listState.layoutInfo.totalItemsCount - rows.size + rows.indexOfFirst { it.studentId == id } }
            val focusOrder = rows.filterNot { it.absent }.map { it.studentId }
            val focusRow = { id: String ->
                scope.launch { focusRowAt(listState, indexOf(id), requesters[id], animate = false) }
                Unit
            }
            LaunchedEffect(state.scrollToStudentId) {
                val id = state.scrollToStudentId ?: return@LaunchedEffect
                focusRowAt(listState, indexOf(id), requesters[id].takeIf { editable }, animate = true)
                actions.onScrollHandled()
            }
            SheetList(listState, modifier) {
                marksBanners(state, actions.onDiscardLocal)
                item(key = "header") { SheetHeader(sheet, counts.entered, counts.absent, counts.pending) }
                if (rows.isEmpty()) {
                    item(key = "empty") { EmptyState(stringResource(R.string.exams_roster_empty), icon = Icons.Outlined.Groups) }
                }
                if (editable) {
                    items(rows, key = { it.studentId }) { row ->
                        val next = focusOrder.getOrNull(focusOrder.indexOf(row.studentId) + 1)
                        MarkEntryRow(
                            row = row,
                            maxMarks = state.maxMarks,
                            focusRequester = requesters.getOrPut(row.studentId) { FocusRequester() },
                            imeAction = if (next != null) ImeAction.Next else ImeAction.Done,
                            onMarksChange = { actions.onMarksChange(row.studentId, it) },
                            onAbsentChange = { actions.onAbsentChange(row.studentId, it) },
                            onImeAction = { if (next != null) focusRow(next) else focusManager.clearFocus() },
                            enabled = state.busyAction == null,
                        )
                    }
                } else {
                    items(sheet.rows, key = { it.studentId }) { row ->
                        MarkValueRow(row.rollNo, row.name, row.marks, row.absent, sheet.maxMarks)
                    }
                }
            }
        }
    }
}

/** Brings the row at [index] on screen (composing it if needed) and then focuses its field. */
private suspend fun focusRowAt(listState: LazyListState, index: Int, requester: FocusRequester?, animate: Boolean) {
    if (index < 0) return
    val visible = listState.layoutInfo.visibleItemsInfo.any { it.index == index }
    when {
        animate -> listState.animateScrollToItem(index)
        !visible -> listState.scrollToItem(index)
    }
    if (requester == null) return
    withFrameNanos { }
    runCatching { requester.requestFocus() }
}
