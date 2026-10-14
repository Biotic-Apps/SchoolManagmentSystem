package com.schoolapp.core.network.dto.settings

import kotlinx.serialization.Serializable

@Serializable
data class LateFeeDefaultDto(val amountMinor: Long, val afterDays: Int)

@Serializable
data class PasswordPolicyDto(val minLength: Int? = null, val requireDigit: Boolean? = null)

/** GET/PATCH `/settings/policies?schoolId=` (PATCH replaces `approvalLimits` as a whole map). */
@Serializable
data class PoliciesDto(
    val attendanceLockTime: String? = null,
    val diaryModeration: Boolean = false,
    val gradingDefault: String? = null,
    val feeLateFeeDefault: LateFeeDefaultDto? = null,
    val approvalLimits: Map<String, Long> = emptyMap(),
    val passwordPolicy: PasswordPolicyDto = PasswordPolicyDto(),
    val sessionTimeoutMinutes: Int? = null,
    val twoFactorRequiredFor: List<String> = emptyList(),
)
