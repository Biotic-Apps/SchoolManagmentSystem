package com.schoolapp.feature.notices

import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavHostController
import androidx.navigation.compose.composable
import com.schoolapp.core.navigation.NoticesDestination
import com.schoolapp.feature.notices.compose.NoticeComposeRoute
import com.schoolapp.feature.notices.detail.NoticeDetailRoute
import com.schoolapp.feature.notices.feed.NoticesRoute
import kotlinx.serialization.Serializable

@Serializable
internal data class NoticeDetailDestination(val id: String)

@Serializable
internal data object NoticeComposeDestination

fun NavGraphBuilder.noticesDestinations(navController: NavHostController) {
    composable<NoticesDestination> {
        NoticesRoute(
            onBack = navController::popBackStack,
            onOpenNotice = { navController.navigate(NoticeDetailDestination(it)) },
            onCompose = { navController.navigate(NoticeComposeDestination) },
        )
    }
    composable<NoticeDetailDestination> { NoticeDetailRoute(onBack = navController::popBackStack) }
    composable<NoticeComposeDestination> { NoticeComposeRoute(onBack = navController::popBackStack) }
}
