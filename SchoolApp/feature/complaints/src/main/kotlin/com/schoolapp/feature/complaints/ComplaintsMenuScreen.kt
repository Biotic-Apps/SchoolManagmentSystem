package com.schoolapp.feature.complaints

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.compose.LifecycleEventEffect
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.model.RoleRef
import com.schoolapp.core.model.complaint.ComplaintBox
import com.schoolapp.feature.complaints.list.ComplaintsActions
import com.schoolapp.feature.complaints.list.ComplaintsScreen
import com.schoolapp.feature.complaints.list.ComplaintsViewModel

/** Menu `complaints` (every role): my / assigned / all boxes and "File complaint". */
@Composable
fun ComplaintsMenuScreen(
    role: RoleRef,
    onOpen: (Any) -> Unit,
    modifier: Modifier = Modifier,
) {
    val viewModel: ComplaintsViewModel = hiltViewModel()
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    LifecycleEventEffect(Lifecycle.Event.ON_RESUME) { viewModel.onResume() }
    ComplaintsScreen(
        state = state,
        actions = ComplaintsActions(
            onTabSelected = viewModel::onTabSelected,
            onRefresh = viewModel::refresh,
            onOpenComplaint = { onOpen(ComplaintDetailDestination(it.id, mine = state.box == ComplaintBox.MINE)) },
            onFile = { onOpen(FileComplaintDestination) },
            onSearchChange = viewModel::onSearchChange,
            onStatus = viewModel::onStatusSelected,
            onCategory = viewModel::onCategorySelected,
            onClearFilters = viewModel::onClearFilters,
            onLoadMore = viewModel::loadMore,
            onRetryMore = viewModel::retryMore,
        ),
        modifier = modifier,
    )
}
