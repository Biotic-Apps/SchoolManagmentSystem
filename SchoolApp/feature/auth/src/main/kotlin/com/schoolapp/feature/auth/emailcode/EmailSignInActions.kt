package com.schoolapp.feature.auth.emailcode

import androidx.compose.runtime.Immutable

/** Events the email sign-in card emits. */
@Immutable
data class EmailSignInActions(
    val onEmailChange: (String) -> Unit = {},
    val onSendCode: () -> Unit = {},
    val onCodeChange: (String) -> Unit = {},
    val onVerify: () -> Unit = {},
    val onResend: () -> Unit = {},
    val onChangeEmail: () -> Unit = {},
    val onUsePassword: () -> Unit = {},
)
