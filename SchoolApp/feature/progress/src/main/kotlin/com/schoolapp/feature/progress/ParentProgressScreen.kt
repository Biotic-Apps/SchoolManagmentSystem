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
import com.schoolapp.feature.progress.parent.ChildHomeworkRoute

/**
 * Parent menu `progress` ("Progress & Results"): results with report cards and teacher feedback
 * ([resultsContent], supplied by the exams feature) and the child's homework status.
 */
@Composable
fun ParentProgressScreen(resultsContent: @Composable (Modifier) -> Unit, modifier: Modifier = Modifier) {
    var tab by rememberSaveable { mutableIntStateOf(0) }
    Column(modifier.fillMaxSize()) {
        AppTabs(
            titles = listOf(stringResource(R.string.progress_tab_results), stringResource(R.string.progress_tab_homework)),
            selectedIndex = tab,
            onSelect = { tab = it },
            modifier = Modifier.fillMaxWidth(),
        )
        val content = Modifier.weight(1f)
        when (tab) {
            0 -> resultsContent(content)
            else -> ChildHomeworkRoute(content, hiltViewModel(key = "progress_parent_homework"))
        }
    }
}
