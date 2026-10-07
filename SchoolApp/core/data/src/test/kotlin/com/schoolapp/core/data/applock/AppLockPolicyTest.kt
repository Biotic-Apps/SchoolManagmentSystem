package com.schoolapp.core.data.applock

import androidx.biometric.BiometricManager.Authenticators.BIOMETRIC_STRONG
import androidx.biometric.BiometricManager.Authenticators.BIOMETRIC_WEAK
import androidx.biometric.BiometricManager.Authenticators.DEVICE_CREDENTIAL
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class AppLockPolicyTest {

    @Test
    fun five_minutes_is_the_boundary() {
        val start = 10_000L
        assertFalse(AppLockPolicy.expired(start, start))
        assertFalse(AppLockPolicy.expired(start, start + 5 * 60_000L))
        assertTrue(AppLockPolicy.expired(start, start + 5 * 60_000L + 1))
    }

    @Test
    fun strong_biometric_with_device_credential_from_android_11() {
        assertEquals(BIOMETRIC_STRONG or DEVICE_CREDENTIAL, AppLockAuthenticators.forSdk(30))
        assertEquals(BIOMETRIC_STRONG or DEVICE_CREDENTIAL, AppLockAuthenticators.forSdk(36))
    }

    @Test
    fun older_android_falls_back_to_weak_biometric_with_device_credential() {
        assertEquals(BIOMETRIC_WEAK or DEVICE_CREDENTIAL, AppLockAuthenticators.forSdk(29))
        assertEquals(BIOMETRIC_WEAK or DEVICE_CREDENTIAL, AppLockAuthenticators.forSdk(24))
    }
}
