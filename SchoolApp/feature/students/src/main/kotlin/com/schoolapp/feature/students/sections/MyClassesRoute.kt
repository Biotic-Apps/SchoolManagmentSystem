package com.schoolapp.feature.students.sections

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.feature.students.components.sectionLabel

/** "My Classes & Students" (teacher/helper) and "Students" (supervisors). */
@Composable
fun MyClassesRoute(
    onOpenSection: (sectionId: String, title: String) -> Unit,
    onOpenStudent: (String) -> Unit,
    modifier: Modifier = Modifier,
    viewModel: MyClassesViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    MyClassesScreen(
        state = state,
        onQueryChange = viewModel::onQueryChange,
        onOpenSection = { onOpenSection(it.id, sectionLabel(it.className, it.name) ?: it.name) },
        onOpenStudent = onOpenStudent,
        onRetry = viewModel::load,
        modifier = modifier,
    )
}
