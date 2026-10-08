package com.schoolapp.feature.auth

import androidx.compose.runtime.Immutable

/** Events the sign-in screen emits; both steps share one screen. */
@Immutable
data class LoginActions(
    val onIdentifierChange: (String) -> Unit = {},
    val onPasswordChange: (String) -> Unit = {},
    val onSubmit: () -> Unit = {},
    val onForgotPassword: () -> Unit = {},
    val onCodeChange: (String) -> Unit = {},
    val onToggleCodeMode: () -> Unit = {},
    val onVerify: () -> Unit = {},
    val onBackToSignIn: () -> Unit = {},
    val onUseEmailCode: () -> Unit = {},
)
