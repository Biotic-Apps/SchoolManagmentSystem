package com.schoolapp.feature.exams

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppTabs
import com.schoolapp.feature.exams.classresults.ClassResultsRoute

/**
 * Staff exams menu: the role's main tab ([mainTitle], e.g. mark sheets or completeness) plus "Class results"
 * when the user has `exams.view`. Without it only the main tab is shown, with no tab row.
 */
@Composable
internal fun StaffExamsTabs(
    key: String,
    mainTitle: String,
    modifier: Modifier = Modifier,
    viewModel: ExamsTabsViewModel = hiltViewModel(key = "${key}_tabs"),
    main: @Composable (Modifier) -> Unit,
) {
    val canViewResults by viewModel.canViewResults.collectAsStateWithLifecycle()
    if (!canViewResults) {
        main(modifier)
        return
    }
    var tab by rememberSaveable { mutableIntStateOf(0) }
    Column(modifier.fillMaxSize()) {
        AppTabs(
            titles = listOf(mainTitle, stringResource(R.string.exams_tab_class_results)),
            selectedIndex = tab,
            onSelect = { tab = it },
        )
        when (tab) {
            0 -> main(Modifier.weight(1f))
            else -> ClassResultsRoute(Modifier.weight(1f), hiltViewModel(key = "${key}_class_results"))
        }
    }
}
