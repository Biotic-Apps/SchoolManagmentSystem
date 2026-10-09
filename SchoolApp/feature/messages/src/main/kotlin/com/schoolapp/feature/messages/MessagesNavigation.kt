package com.schoolapp.feature.messages

import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavHostController
import androidx.navigation.compose.composable
import com.schoolapp.core.navigation.MessageThreadDestination
import com.schoolapp.core.navigation.NewThreadDestination
import com.schoolapp.feature.messages.conversation.ConversationRoute
import com.schoolapp.feature.messages.newthread.NewThreadRoute

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
