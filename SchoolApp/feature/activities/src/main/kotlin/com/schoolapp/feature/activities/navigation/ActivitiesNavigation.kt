package com.schoolapp.feature.activities.navigation

import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavHostController
import androidx.navigation.compose.composable
import com.schoolapp.core.navigation.ActivitiesDestination
import com.schoolapp.feature.activities.detail.ActivityDetailRoute
import com.schoolapp.feature.activities.list.ActivitiesListRoute
import com.schoolapp.feature.activities.propose.ProposeActivityRoute
import kotlinx.serialization.Serializable

@Serializable
internal data class ActivityDetailDestination(val activityId: String)

@Serializable
internal data object ProposeActivityDestination

fun NavGraphBuilder.activitiesDestinations(navController: NavHostController) {
    composable<ActivitiesDestination> {
        ActivitiesListRoute(
            onOpenActivity = { navController.navigate(ActivityDetailDestination(it)) },
            onPropose = { navController.navigate(ProposeActivityDestination) },
            onBack = navController::popBackStack,
        )
    }
    composable<ActivityDetailDestination> { ActivityDetailRoute(onBack = navController::popBackStack) }
    composable<ProposeActivityDestination> { ProposeActivityRoute(onBack = navController::popBackStack) }
}
