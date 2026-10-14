package com.schoolapp.feature.admissions.list

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
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.compose.LifecycleEventEffect
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppTabs
import com.schoolapp.feature.admissions.R
import com.schoolapp.feature.admissions.enquiries.EnquiriesTab
import com.schoolapp.feature.admissions.enquiries.EnquiriesViewModel
import com.schoolapp.feature.admissions.waiting.WaitingListTab
import com.schoolapp.feature.admissions.waiting.WaitingListViewModel

/** Admissions: enquiries, applications and the waiting list, like the web page's three tabs. */
@Composable
fun AdmissionsRoute(
    onOpenApplication: (String) -> Unit,
    modifier: Modifier = Modifier,
    onNewApplication: () -> Unit = {},
    viewModel: AdmissionsViewModel = hiltViewModel(),
    enquiriesViewModel: EnquiriesViewModel = hiltViewModel(),
    waitingListViewModel: WaitingListViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    var tab by rememberSaveable { mutableIntStateOf(TAB_ENQUIRIES) }
    // Back from an application (decided, confirmed, converted...): show fresh lists.
    var resumed by rememberSaveable { mutableIntStateOf(0) }
    LifecycleEventEffect(Lifecycle.Event.ON_RESUME) {
        if (resumed++ > 0) {
            viewModel.refresh()
            enquiriesViewModel.refresh()
            waitingListViewModel.refresh()
        }
    }
    Column(modifier.fillMaxSize()) {
        AppTabs(
            titles = listOf(
                stringResource(R.string.admissions_tab_enquiries),
                stringResource(R.string.admissions_tab_applications),
                stringResource(R.string.admissions_tab_waiting),
            ),
            selectedIndex = tab,
            onSelect = { tab = it },
            modifier = Modifier.fillMaxWidth(),
        )
        val content = Modifier.weight(1f)
        when (tab) {
            TAB_ENQUIRIES -> EnquiriesTab(onOpenApplication, content, enquiriesViewModel)
            TAB_APPLICATIONS -> ApplicationsTab(
                state = state,
                onFilter = viewModel::onFilter,
                onQuery = viewModel::onQuery,
                onOpenApplication = onOpenApplication,
                onNewApplication = onNewApplication,
                onRetry = viewModel::load,
                onRefresh = viewModel::refresh,
                modifier = content,
            )
            else -> WaitingListTab(onOpenApplication, content, waitingListViewModel)
        }
    }
}

private const val TAB_ENQUIRIES = 0
private const val TAB_APPLICATIONS = 1
