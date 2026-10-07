package com.schoolapp.feature.auth.navigation

import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavHostController
import androidx.navigation.compose.composable
import androidx.navigation.compose.navigation
import com.schoolapp.core.navigation.LoginDestination
import com.schoolapp.feature.auth.LoginRoute
import com.schoolapp.feature.auth.forgot.ForgotPasswordRoute
import com.schoolapp.feature.auth.reset.ResetPasswordRoute
import kotlinx.serialization.Serializable

/** Signed-out graph: sign-in plus account recovery. The app only leaves it when the auth state changes. */
@Serializable
data object AuthGraph

@Serializable
data object ForgotPasswordDestination

@Serializable
data object ResetPasswordDestination

fun NavGraphBuilder.authGraph(navController: NavHostController) {
    val backToSignIn: () -> Unit = { navController.popBackStack(LoginDestination, inclusive = false) }
    navigation<AuthGraph>(startDestination = LoginDestination) {
        composable<LoginDestination> {
            LoginRoute(
                onForgotPassword = { navController.navigate(ForgotPasswordDestination) { launchSingleTop = true } },
            )
        }
        composable<ForgotPasswordDestination> {
            ForgotPasswordRoute(
                onBackToSignIn = backToSignIn,
                onHaveResetCode = { navController.navigate(ResetPasswordDestination) { launchSingleTop = true } },
            )
        }
        composable<ResetPasswordDestination> {
            ResetPasswordRoute(onBack = { navController.popBackStack() }, onBackToSignIn = backToSignIn)
        }
    }
}
