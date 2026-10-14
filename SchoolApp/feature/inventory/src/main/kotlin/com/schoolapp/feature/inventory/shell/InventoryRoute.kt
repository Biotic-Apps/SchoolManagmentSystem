package com.schoolapp.feature.inventory.shell

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Business
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.LifecycleResumeEffect
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppTabs
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.PullableState
import com.schoolapp.core.designsystem.component.ScopePicker
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.inventory.R
import com.schoolapp.feature.inventory.components.SavedEffect

/** Inventory & Purchasing: branch picker (global roles), tabs, the tab's add button and form sheets. */
@Composable
internal fun InventoryRoute(roleKey: String, onOpen: (Any) -> Unit, modifier: Modifier = Modifier) {
    val vms = rememberInventoryViewModels(roleKey)
    val state by vms.shell.uiState.collectAsStateWithLifecycle()
    val snackbar = remember { SnackbarHostState() }
    SavedEffect(vms.saved, snackbar) { vms.shell.onChanged() }
    var resumedOnce by remember { mutableStateOf(false) }
    LifecycleResumeEffect(vms) {
        // Back from a purchase request (ordered, received, billed): refresh quietly.
        if (resumedOnce) vms.shell.onChanged()
        resumedOnce = true
        onPauseOrDispose { }
    }
    val branchId = state.branchId
    Box(modifier.fillMaxSize()) {
        when {
            state.isLoading -> LoadingState()
            state.error != null -> PullableState { ErrorState(appErrorMessage(state.error!!), onRetry = vms.shell::retry) }
            branchId == null -> PullableState {
                EmptyState(stringResource(R.string.inv_no_branch), message = stringResource(R.string.inv_no_branch_message), icon = Icons.Outlined.Business)
            }
            else -> {
                val tabs = state.tabs
                var index by rememberSaveable { mutableIntStateOf(0) }
                val tab = tabs.getOrElse(index) { tabs.first() }
                LaunchedEffect(tab, branchId, state.version) { vms.bind(tab, branchId, state.version) }
                Column(Modifier.fillMaxSize()) {
                    if (state.showBranchPicker) {
                        ScopePicker(
                            state.branches.map { SwitcherOption(it.id, it.name) },
                            branchId,
                            vms.shell::onBranchSelected,
                            Modifier.padding(start = 16.dp, top = 12.dp, end = 16.dp),
                        )
                    }
                    AppTabs(titles = tabs.map { stringResource(it.title()) }, selectedIndex = tabs.indexOf(tab), onSelect = { index = it })
                    InventoryTabContent(tab, state, vms, onOpen, Modifier.weight(1f))
                }
                InventoryFab(tab, state, vms, Modifier.align(Alignment.BottomEnd).padding(16.dp))
                InventorySheets(state, vms)
            }
        }
        SnackbarHost(snackbar, Modifier.align(Alignment.BottomCenter).padding(bottom = 72.dp))
    }
}

private fun InventoryTab.title(): Int = when (this) {
    InventoryTab.STOCK -> R.string.inv_tab_stock
    InventoryTab.ITEMS -> R.string.inv_tab_items
    InventoryTab.MOVEMENTS -> R.string.inv_tab_movements
    InventoryTab.ASSETS -> R.string.inv_tab_assets
    InventoryTab.PURCHASING -> R.string.inv_tab_purchasing
    InventoryTab.SALES -> R.string.inv_tab_sales
}
