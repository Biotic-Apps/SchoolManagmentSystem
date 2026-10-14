package com.schoolapp.feature.reports

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import com.schoolapp.core.model.RoleRef
import com.schoolapp.feature.reports.catalog.ReportsRoute

/**
 * Menu `reports` (Reports & History): the reports this role may run (server-filtered), a filter sheet per report,
 * and exports started on this device with their status and download link. Same for every role that has the menu.
 */
@Composable
@Suppress("UnusedParameter")
fun ReportsMenuScreen(role: RoleRef, onOpen: (Any) -> Unit, modifier: Modifier = Modifier) {
    ReportsRoute(modifier, viewModel = hiltViewModel(key = "reports_${role.key}"))
}
