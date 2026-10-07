package com.schoolapp.feature.auth.phone

import androidx.compose.runtime.Immutable

/** Events the phone sign-in card emits. */
@Immutable
data class PhoneSignInActions(
    val onPhoneChange: (String) -> Unit = {},
    val onSendCode: () -> Unit = {},
    val onCodeChange: (String) -> Unit = {},
    val onVerify: () -> Unit = {},
    val onResend: () -> Unit = {},
    val onChangeNumber: () -> Unit = {},
    val onUsePassword: () -> Unit = {},
)
