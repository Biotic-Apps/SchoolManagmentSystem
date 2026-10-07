package com.schoolapp.core.data.applock

import android.os.Build
import androidx.biometric.BiometricManager.Authenticators.BIOMETRIC_STRONG
import androidx.biometric.BiometricManager.Authenticators.BIOMETRIC_WEAK
import androidx.biometric.BiometricManager.Authenticators.DEVICE_CREDENTIAL

/**
 * Strong biometric with the device PIN / pattern / password as fallback. Android 9–10 cannot combine
 * BIOMETRIC_STRONG with DEVICE_CREDENTIAL, so those versions use BIOMETRIC_WEAK with the fallback.
 */
object AppLockAuthenticators {
    val allowed: Int get() = forSdk(Build.VERSION.SDK_INT)

    fun forSdk(sdkInt: Int): Int =
        if (sdkInt >= Build.VERSION_CODES.R) BIOMETRIC_STRONG or DEVICE_CREDENTIAL else BIOMETRIC_WEAK or DEVICE_CREDENTIAL
}
