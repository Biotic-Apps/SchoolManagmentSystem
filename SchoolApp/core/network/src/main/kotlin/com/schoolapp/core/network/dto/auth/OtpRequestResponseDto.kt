package com.schoolapp.core.network.dto.auth

import kotlinx.serialization.Serializable

/** Always `{ ok: true, resendAfterSeconds }`, whether or not the email belongs to a parent (no enumeration). */
@Serializable
data class OtpRequestResponseDto(
    val ok: Boolean = true,
    val resendAfterSeconds: Int = DEFAULT_RESEND_SECONDS,
) {
    companion object {
        const val DEFAULT_RESEND_SECONDS = 60
    }
}
