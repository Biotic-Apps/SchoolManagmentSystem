package com.schoolapp.core.data.applock

import android.content.Context
import androidx.biometric.BiometricManager
import com.schoolapp.core.common.dispatcher.IoDispatcher
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.withContext
import javax.inject.Inject

/** Binder call into the system biometric service, so it runs on IO. */
internal class BiometricDeviceLockChecker @Inject constructor(
    @ApplicationContext private val context: Context,
    @IoDispatcher private val io: CoroutineDispatcher,
) : DeviceLockChecker {

    override suspend fun availability(): AppLockAvailability = withContext(io) {
        when (BiometricManager.from(context).canAuthenticate(AppLockAuthenticators.allowed)) {
            BiometricManager.BIOMETRIC_SUCCESS -> AppLockAvailability.AVAILABLE
            BiometricManager.BIOMETRIC_ERROR_NONE_ENROLLED -> AppLockAvailability.NO_DEVICE_LOCK
            else -> AppLockAvailability.UNSUPPORTED
        }
    }
}
