package com.schoolapp.core.model.people

/** Result of `POST /child-links/request`: the OTP went to [maskedPhone]; [devCode] only in development. */
data class ChildLinkChallenge(val requestId: String, val maskedPhone: String?, val devCode: String? = null)
