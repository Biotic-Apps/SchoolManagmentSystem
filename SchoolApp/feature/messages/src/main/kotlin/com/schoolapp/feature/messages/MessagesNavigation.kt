package com.schoolapp.feature.messages

import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavHostController
import androidx.navigation.compose.composable
import com.schoolapp.core.navigation.MessageThreadDestination
import com.schoolapp.feature.messages.conversation.ConversationRoute
import com.schoolapp.feature.messages.newthread.NewThreadRoute
import kotlinx.serialization.Serializable

/** Start a conversation (parent: about a child; staff: with a student's guardians). */
@Serializable
internal data object NewThreadDestination

fun NavGraphBuilder.messagesDestinations(navController: NavHostController) {
    composable<MessageThreadDestination> { ConversationRoute(onBack = navController::popBackStack) }
    composable<NewThreadDestination> {
        NewThreadRoute(
            onBack = navController::popBackStack,
            onCreated = { threadId ->
                navController.navigate(MessageThreadDestination(threadId)) {
                    popUpTo<NewThreadDestination> { inclusive = true }
                }
            },
        )
    }
}
