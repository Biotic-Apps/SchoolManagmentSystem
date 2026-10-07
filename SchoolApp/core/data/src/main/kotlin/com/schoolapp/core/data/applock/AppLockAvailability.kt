package com.schoolapp.core.data.applock

/** Whether this device can protect the app with a fingerprint, face or screen lock. */
enum class AppLockAvailability {
    AVAILABLE,

    /** No PIN, pattern, password or biometric is set up on the device. */
    NO_DEVICE_LOCK,

    /** The hardware or OS version cannot do it (or the check failed). */
    UNSUPPORTED,
}
