package com.schoolapp.feature.settings.policies

import androidx.compose.runtime.Immutable
import com.schoolapp.core.designsystem.money.MoneyFormat
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.settings.ApprovalLimitTypes
import com.schoolapp.core.model.settings.LateFeeDefault
import com.schoolapp.core.model.settings.PolicySettings

/** Editable Policies values as typed text (web policy-schemas.ts). */
@Immutable
internal data class PolicyForm(
    val passwordMinLength: String = "8",
    val requireDigit: Boolean = false,
    val sessionTimeoutMinutes: String = "60",
    val twoFactorRequiredFor: Set<String> = emptySet(),
    val attendanceLockTime: String = "11:00",
    val diaryModeration: Boolean = false,
    val gradingDefault: String = "",
    val lateFeeAmount: String = "",
    val lateFeeAfterDays: String = "",
    val approvalLimits: Map<String, String> = ApprovalLimitTypes.ALL.associateWith { "" },
) {
    /** Problems keyed by field name; empty when the form can be saved. */
    fun problems(): Map<String, PolicyProblem> = buildMap {
        if (!passwordMinLength.isWholeIn(PASSWORD_MIN, PASSWORD_MAX)) put(PASSWORD_MIN_LENGTH, PolicyProblem.PASSWORD_RANGE)
        if (!sessionTimeoutMinutes.isWholeIn(TIMEOUT_MIN, TIMEOUT_MAX)) put(SESSION_TIMEOUT, PolicyProblem.TIMEOUT_RANGE)
        if (!TIME.matches(attendanceLockTime)) put(LOCK_TIME, PolicyProblem.TIME)
        if (gradingDefault.trim().length > GRADING_MAX) put(GRADING, PolicyProblem.TOO_LONG)
        if (lateFeeAmount.isNotBlank()) {
            if (MoneyFormat.parse(lateFeeAmount) == null) put(LATE_FEE, PolicyProblem.MONEY)
            if (!lateFeeAfterDays.isWholeIn(DAYS_MIN, DAYS_MAX)) put(LATE_FEE_DAYS, PolicyProblem.DAYS_RANGE)
        }
        approvalLimits.forEach { (type, text) ->
            if (text.isNotBlank() && MoneyFormat.parse(text) == null) put(limitKey(type), PolicyProblem.MONEY)
        }
    }

    /** Limits for other request types are kept; a blank limit is removed. */
    fun toSettings(current: PolicySettings): PolicySettings {
        val limits = current.approvalLimits.toMutableMap()
        ApprovalLimitTypes.ALL.forEach { type ->
            val amount = approvalLimits[type]?.let(MoneyFormat::parse)
            if (amount == null) limits.remove(type) else limits[type] = amount
        }
        val lateFee = MoneyFormat.parse(lateFeeAmount)
        return PolicySettings(
            attendanceLockTime = attendanceLockTime,
            diaryModeration = diaryModeration,
            gradingDefault = gradingDefault.trim().ifBlank { null },
            lateFee = lateFee?.let { LateFeeDefault(it, lateFeeAfterDays.trim().toInt()) },
            approvalLimits = limits,
            passwordMinLength = passwordMinLength.trim().toInt(),
            requireDigit = requireDigit,
            sessionTimeoutMinutes = sessionTimeoutMinutes.trim().toInt(),
            twoFactorRequiredFor = RoleKey.entries.map { it.key }.filter { it in twoFactorRequiredFor },
        )
    }

    companion object {
        const val PASSWORD_MIN_LENGTH = "passwordPolicy.minLength"
        const val SESSION_TIMEOUT = "sessionTimeoutMinutes"
        const val LOCK_TIME = "attendanceLockTime"
        const val GRADING = "gradingDefault"
        const val LATE_FEE = "feeLateFeeDefault.amountMinor"
        const val LATE_FEE_DAYS = "feeLateFeeDefault.afterDays"
        fun limitKey(type: String) = "approvalLimits.$type"

        const val PASSWORD_MIN = 8
        const val PASSWORD_MAX = 64
        const val TIMEOUT_MIN = 5
        const val TIMEOUT_MAX = 1440
        const val DAYS_MIN = 1
        const val DAYS_MAX = 365
        const val GRADING_MAX = 60
        private val TIME = Regex("^([01]\\d|2[0-3]):[0-5]\\d$")
        private val ROLE_KEYS = RoleKey.entries.map { it.key }.toSet()

        fun from(settings: PolicySettings) = PolicyForm(
            passwordMinLength = settings.passwordMinLength.toString(),
            requireDigit = settings.requireDigit,
            sessionTimeoutMinutes = settings.sessionTimeoutMinutes.toString(),
            twoFactorRequiredFor = settings.twoFactorRequiredFor.filter { it in ROLE_KEYS }.toSet(),
            attendanceLockTime = settings.attendanceLockTime.take(TIME_LENGTH),
            diaryModeration = settings.diaryModeration,
            gradingDefault = settings.gradingDefault.orEmpty(),
            lateFeeAmount = settings.lateFee?.let { MoneyFormat.toInput(it.amountMinor) }.orEmpty(),
            lateFeeAfterDays = settings.lateFee?.afterDays?.toString().orEmpty(),
            approvalLimits = ApprovalLimitTypes.ALL.associateWith { type ->
                settings.approvalLimits[type]?.let(MoneyFormat::toInput).orEmpty()
            },
        )

        private const val TIME_LENGTH = 5
    }
}

internal enum class PolicyProblem { PASSWORD_RANGE, TIMEOUT_RANGE, TIME, TOO_LONG, MONEY, DAYS_RANGE }

private fun String.isWholeIn(min: Int, max: Int): Boolean {
    val text = trim()
    if (text.isEmpty() || !text.all(Char::isDigit) || text.length > MAX_DIGITS) return false
    return text.toInt() in min..max
}

private const val MAX_DIGITS = 6
