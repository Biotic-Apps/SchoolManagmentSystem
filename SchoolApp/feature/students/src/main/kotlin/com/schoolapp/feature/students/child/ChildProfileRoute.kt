package com.schoolapp.feature.students.child

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle

@Composable
fun ChildProfileRoute(
    onRequestCorrection: () -> Unit,
    onLinkChild: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: ChildProfileViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    ChildProfileScreen(
        state = state,
        onRetry = viewModel::retry,
        onRequestCorrection = onRequestCorrection,
        onLinkChild = onLinkChild,
        modifier = modifier,
    )
}
