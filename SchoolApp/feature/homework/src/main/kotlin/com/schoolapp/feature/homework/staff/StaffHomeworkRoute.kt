package com.schoolapp.feature.homework.staff

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.model.homework.Homework
import com.schoolapp.feature.homework.AssignHomeworkDestination
import com.schoolapp.feature.homework.HomeworkSubmissionsDestination
import com.schoolapp.feature.homework.components.changeMessage
import com.schoolapp.feature.homework.components.sectionLabel

@Composable
internal fun StaffHomeworkRoute(
    onOpen: (Any) -> Unit,
    modifier: Modifier = Modifier,
    viewModel: StaffHomeworkViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val snackbar = remember { SnackbarHostState() }
    val message = state.change?.let { changeMessage(it) }
    LaunchedEffect(message) {
        if (message != null) {
            viewModel.onChangeShown()
            snackbar.showSnackbar(message)
        }
    }
    val section = state.selectedSection
    val sectionName = section?.let { sectionLabel(it) }.orEmpty()
    Box(modifier.fillMaxSize()) {
        StaffHomeworkContent(
            state = state,
            actions = StaffHomeworkActions(
                onBranchSelected = viewModel::onBranchSelected,
                onSectionSelected = viewModel::onSectionSelected,
                onAssign = {
                    if (section != null) onOpen(AssignHomeworkDestination(section.id, section.classId, sectionName))
                },
                onOpenHomework = { onOpen(it.toSubmissionsDestination()) },
                onRefresh = viewModel::refresh,
                onRetry = viewModel::retry,
            ),
        )
        SnackbarHost(snackbar, Modifier.align(Alignment.BottomCenter).padding(16.dp))
    }
}

private fun Homework.toSubmissionsDestination() = HomeworkSubmissionsDestination(
    homeworkId = id,
    title = title,
    subjectName = subjectName,
    dueDate = dueDate,
    maxMarks = maxMarks,
)
