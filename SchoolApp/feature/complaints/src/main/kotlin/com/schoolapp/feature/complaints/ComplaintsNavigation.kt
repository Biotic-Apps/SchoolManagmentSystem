package com.schoolapp.feature.complaints

import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavHostController
import androidx.navigation.compose.composable
import com.schoolapp.feature.complaints.detail.ComplaintDetailRoute
import com.schoolapp.feature.complaints.file.FileComplaintRoute
import kotlinx.serialization.Serializable

/** [mine] = opened from "My complaints" (the viewer filed it, even when anonymous). */
@Serializable
internal data class ComplaintDetailDestination(val complaintId: String, val mine: Boolean = false)

@Serializable
internal data object FileComplaintDestination

fun NavGraphBuilder.complaintsDestinations(navController: NavHostController) {
    composable<ComplaintDetailDestination> { ComplaintDetailRoute(onBack = navController::popBackStack) }
    composable<FileComplaintDestination> {
        FileComplaintRoute(
            onBack = navController::popBackStack,
            onFiled = { id ->
                navController.navigate(ComplaintDetailDestination(id, mine = true)) {
                    popUpTo<FileComplaintDestination> { inclusive = true }
                }
            },
        )
    }
}
