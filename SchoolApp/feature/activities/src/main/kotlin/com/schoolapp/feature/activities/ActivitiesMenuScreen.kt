package com.schoolapp.feature.activities

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import com.schoolapp.core.model.RoleRef
import com.schoolapp.feature.activities.list.ActivitiesListRoute
import com.schoolapp.feature.activities.navigation.ActivityDetailDestination
import com.schoolapp.feature.activities.navigation.ProposeActivityDestination

/** Menu id `activities`, rendered inside the role shell (no top bar). The ViewModel is keyed by [role] so a role switch reloads. */
@Composable
fun ActivitiesMenuScreen(role: RoleRef, onOpen: (Any) -> Unit, modifier: Modifier = Modifier) {
    ActivitiesListRoute(
        onOpenActivity = { onOpen(ActivityDetailDestination(it)) },
        onPropose = { onOpen(ProposeActivityDestination()) },
        modifier = modifier,
        viewModel = hiltViewModel(key = "activities_${role.key}"),
    )
}
