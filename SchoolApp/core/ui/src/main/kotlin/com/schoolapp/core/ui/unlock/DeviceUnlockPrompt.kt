package com.schoolapp.core.ui.unlock

import android.content.Context
import android.content.ContextWrapper
import androidx.biometric.BiometricPrompt
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.ui.platform.LocalContext
import androidx.core.content.ContextCompat
import androidx.fragment.app.FragmentActivity

/**
 * Returns a launcher for the system prompt (fingerprint / face with the device PIN, pattern or
 * password as fallback). [authenticators] are `BiometricManager.Authenticators` flags and must
 * include `DEVICE_CREDENTIAL`, so the prompt has no custom cancel button. Needs a [FragmentActivity].
 */
@Composable
fun rememberDeviceUnlockPrompt(
    title: String,
    subtitle: String?,
    authenticators: Int,
    onResult: (UnlockResult) -> Unit,
): () -> Unit {
    val activity = LocalContext.current.findFragmentActivity()
    val latestOnResult by rememberUpdatedState(onResult)
    return remember(activity, title, subtitle, authenticators) {
        launch@{
            val host = activity ?: return@launch latestOnResult(UnlockResult.Error(""))
            val callback = object : BiometricPrompt.AuthenticationCallback() {
                override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) =
                    latestOnResult(UnlockResult.Success)

                override fun onAuthenticationError(errorCode: Int, errString: CharSequence) =
                    latestOnResult(if (errorCode in CancelCodes) UnlockResult.Cancelled else UnlockResult.Error(errString.toString()))
            }
            val info = BiometricPrompt.PromptInfo.Builder()
                .setTitle(title)
                .apply { subtitle?.let(::setSubtitle) }
                .setAllowedAuthenticators(authenticators)
                .build()
            BiometricPrompt(host, ContextCompat.getMainExecutor(host), callback).authenticate(info)
        }
    }
}

private val CancelCodes = setOf(
    BiometricPrompt.ERROR_USER_CANCELED,
    BiometricPrompt.ERROR_CANCELED,
    BiometricPrompt.ERROR_NEGATIVE_BUTTON,
)

private tailrec fun Context.findFragmentActivity(): FragmentActivity? = when (this) {
    is FragmentActivity -> this
    is ContextWrapper -> baseContext.findFragmentActivity()
    else -> null
}
