package com.schoolapp.core.data.push

/**
 * Source of the device push token. The release app ships [NoOpPushTokenProvider] until a Firebase
 * project is configured: add `google-services.json` + the google-services plugin, implement this with
 * `FirebaseMessaging.getInstance().token`, and bind it instead. [DeviceRegistrar] then registers the
 * token with `POST /devices` after sign-in.
 */
fun interface PushTokenProvider {
    /** Current token, or null when push is not configured on this build. */
    suspend fun token(): String?
}

object NoOpPushTokenProvider : PushTokenProvider {
    override suspend fun token(): String? = null
}
