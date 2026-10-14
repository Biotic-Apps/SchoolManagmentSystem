package com.schoolapp.core.model.profile

/** Two-step sign-in state of the signed-in account; [required] means a school policy covers one of its roles. */
data class TwoFactorStatus(val enabled: Boolean, val required: Boolean)

/** A pending authenticator setup: [otpauthUrl] goes in the QR code, [secret] (base32) is for typing by hand. */
data class TwoFactorSetup(val otpauthUrl: String, val secret: String)
