package com.schoolapp.feature.progress

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import com.schoolapp.core.designsystem.component.AppTabs
import com.schoolapp.core.model.RoleRef
import com.schoolapp.feature.progress.homework.HomeworkRoute
import com.schoolapp.feature.progress.notes.ProgressStudentsRoute

/** Menu `progress` for staff: progress notes and homework completion ticks. */
@Composable
fun ProgressMenuScreen(role: RoleRef, onOpen: (Any) -> Unit, modifier: Modifier = Modifier) {
    var tab by rememberSaveable { mutableIntStateOf(0) }
    Column(modifier.fillMaxSize()) {
        AppTabs(
            titles = listOf(stringResource(R.string.progress_tab_notes), stringResource(R.string.progress_tab_homework)),
            selectedIndex = tab,
            onSelect = { tab = it },
            modifier = Modifier.fillMaxWidth(),
        )
        val content = Modifier.weight(1f)
        when (tab) {
            0 -> ProgressStudentsRoute(onOpen, content, hiltViewModel(key = "progress_notes_${role.key}"))
            else -> HomeworkRoute(content, hiltViewModel(key = "progress_homework_${role.key}"))
        }
    }
}
