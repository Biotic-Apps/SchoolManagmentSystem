package com.schoolapp.feature.organisation.branches.edit

import com.schoolapp.feature.organisation.R

/** Same checks as the web branch form and the API DTOs; returns field → message resource. */
internal object BranchFormRules {
    private val CODE = Regex("^[A-Z0-9]{2,12}$")
    private val PHONE = Regex("^\\+?[0-9][0-9\\s()-]{6,19}$")
    private val EMAIL = Regex("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")
    private const val STAFF_LEAD_MINUTES = 30

    fun validate(form: BranchForm): Map<BranchField, Int> = buildMap {
        if (!form.timingsOnly) putAll(details(form))
        putAll(schedule(form))
    }

    private fun details(form: BranchForm): Map<BranchField, Int> = buildMap {
        if (form.isNew && form.schoolId.isNullOrBlank()) put(BranchField.SCHOOL, R.string.org_branch_pick_school)
        if (form.isNew && !CODE.matches(form.code.trim().uppercase())) put(BranchField.CODE, R.string.org_branch_code_invalid)
        if (form.name.trim().length !in 2..120) put(BranchField.NAME, R.string.org_branch_name_invalid)
        val phone = form.phone.trim()
        if (phone.isNotEmpty() && !PHONE.matches(phone)) put(BranchField.PHONE, R.string.org_phone_invalid)
        val email = form.email.trim()
        if (email.isNotEmpty() && !EMAIL.matches(email)) put(BranchField.EMAIL, R.string.org_email_invalid)
        if (form.address.trim().length > 300) put(BranchField.ADDRESS, R.string.org_address_too_long)
    }

    /** "HH:mm" strings compare correctly as text. */
    private fun schedule(form: BranchForm): Map<BranchField, Int> = buildMap {
        if (form.closesAt <= form.opensAt) put(BranchField.CLOSES, R.string.org_closes_after_opens)
        if (form.attendanceLockAt < form.opensAt || form.attendanceLockAt > form.closesAt) {
            put(BranchField.LOCK, R.string.org_lock_within_hours)
        }
        if (form.staffArrivesAt > form.opensAt) put(BranchField.STAFF_ARRIVE, R.string.org_staff_arrive_rule)
        if (form.staffLeavesAt < form.closesAt) put(BranchField.STAFF_LEAVE, R.string.org_staff_leave_rule)
        if (form.workingDays.isEmpty()) put(BranchField.DAYS, R.string.org_pick_working_day)
    }

    /** "08:00" → "07:30", never before midnight. */
    fun staffArrivalFor(opensAt: String): String {
        val parts = opensAt.split(":").mapNotNull { it.toIntOrNull() }
        if (parts.size < 2) return opensAt
        val minutes = (parts[0] * 60 + parts[1] - STAFF_LEAD_MINUTES).coerceAtLeast(0)
        return String.format(java.util.Locale.US, "%02d:%02d", minutes / 60, minutes % 60)
    }
}
