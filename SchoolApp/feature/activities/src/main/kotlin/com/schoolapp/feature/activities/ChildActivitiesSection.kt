package com.schoolapp.feature.activities

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import com.schoolapp.feature.activities.list.ActivitiesListRoute
import com.schoolapp.feature.activities.navigation.ActivityDetailDestination

/**
 * Parent: the active child's activities (upcoming / past, consent badge) shown inline on the
 * Timetable menu, like the web `ChildActivitiesSection`. Tapping opens the detail with the consent card.
 */
@Composable
fun ChildActivitiesSection(onOpen: (Any) -> Unit, modifier: Modifier = Modifier) {
    ActivitiesListRoute(
        onOpenActivity = { onOpen(ActivityDetailDestination(it)) },
        onPropose = {},
        modifier = modifier,
        viewModel = hiltViewModel(key = "activities_timetable_parent"),
    )
}
