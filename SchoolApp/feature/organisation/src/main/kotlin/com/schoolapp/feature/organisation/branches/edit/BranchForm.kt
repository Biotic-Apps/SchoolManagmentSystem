package com.schoolapp.feature.organisation.branches.edit

import androidx.compose.runtime.Immutable
import com.schoolapp.core.data.common.ActionError
import com.schoolapp.core.model.organisation.Branch
import com.schoolapp.core.model.organisation.BranchDetailsInput
import com.schoolapp.core.model.organisation.BranchScheduleInput
import com.schoolapp.core.model.organisation.BranchTimings
import com.schoolapp.core.model.organisation.NamedOption

enum class BranchField { SCHOOL, CODE, NAME, PHONE, EMAIL, ADDRESS, OPENS, CLOSES, LOCK, STAFF_ARRIVE, STAFF_LEAVE, DAYS }

/** Add / edit branch form, or timings only for a principal ([timingsOnly]). Times are 24-hour `HH:mm`. */
@Immutable
data class BranchForm(
    val branchId: String? = null,
    val timingsOnly: Boolean = false,
    val branchName: String = "",
    val schoolId: String? = null,
    val schoolName: String? = null,
    val schools: List<NamedOption> = emptyList(),
    val code: String = "",
    val name: String = "",
    val address: String = "",
    val phone: String = "",
    val email: String = "",
    val opensAt: String = "08:00",
    val closesAt: String = "14:00",
    val attendanceLockAt: String = "11:00",
    val staffArrivesAt: String = "07:30",
    val staffLeavesAt: String = "14:00",
    val workingDays: Set<Int> = (1..6).toSet(),
    /** Field → string resource of its problem. */
    val errors: Map<BranchField, Int> = emptyMap(),
    val saving: Boolean = false,
    val error: ActionError? = null,
) {
    val isNew: Boolean get() = branchId == null

    fun details() = BranchDetailsInput(schoolId, code.trim().uppercase(), name.trim(), address, phone, email)

    fun schedule() = BranchScheduleInput(
        BranchTimings(opensAt, closesAt, attendanceLockAt, staffArrivesAt, staffLeavesAt),
        workingDays.sorted(),
    )

    companion object {
        fun create(schools: List<NamedOption>, schoolId: String?) =
            BranchForm(schools = schools, schoolId = schoolId ?: schools.singleOrNull()?.id)

        /** Older branches lack staff times: teachers arrive 30 minutes before opening and leave at closing (as the API). */
        fun edit(branch: Branch, timingsOnly: Boolean): BranchForm {
            val t = branch.timings
            val opens = t?.opensAt ?: "08:00"
            val closes = t?.closesAt ?: "14:00"
            return BranchForm(
                branchId = branch.id,
                timingsOnly = timingsOnly,
                branchName = branch.name,
                schoolId = branch.schoolId,
                schoolName = branch.schoolName,
                code = branch.code.orEmpty(),
                name = branch.name,
                address = branch.address.orEmpty(),
                phone = branch.phone.orEmpty(),
                email = branch.email.orEmpty(),
                opensAt = opens,
                closesAt = closes,
                attendanceLockAt = t?.attendanceLockAt ?: "11:00",
                staffArrivesAt = t?.staffArrivesAt ?: BranchFormRules.staffArrivalFor(opens),
                staffLeavesAt = t?.staffLeavesAt ?: closes,
                workingDays = branch.workingDays.toSet().ifEmpty { (1..6).toSet() },
            )
        }
    }
}
