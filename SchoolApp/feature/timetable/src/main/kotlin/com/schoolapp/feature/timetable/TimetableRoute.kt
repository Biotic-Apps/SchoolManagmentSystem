package com.schoolapp.feature.timetable

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle

@Composable
fun TimetableRoute(modifier: Modifier = Modifier, viewModel: TimetableViewModel = hiltViewModel()) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    TimetableScreen(state, viewModel::onDaySelected, viewModel::onSectionSelected, viewModel::retry, modifier)
}
