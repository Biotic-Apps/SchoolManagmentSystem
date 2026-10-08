package com.schoolapp.core.model.staff

/** `POST /staff`; blank optional fields are sent as null (omitted). */
data class NewStaffInput(
    val profile: StaffProfileInput,
    val branchId: String,
    val createAccount: Boolean,
    /** Role of the new login; only sent when [createAccount]. */
    val roleKey: String?,
)

/** Personal and job fields shared by add (`POST /staff`) and edit (`PATCH /staff/:id`). */
data class StaffProfileInput(
    val name: String,
    val email: String?,
    val phone: String?,
    val employeeNo: String?,
    val designation: String,
    val joinDate: String,
    /** Edit: null keeps the CNIC on file (it arrives masked). */
    val cnic: String?,
    val qualification: String?,
)

/** `POST /staff` response; [temporaryPassword] only when a new login was created (shown once). */
data class CreatedStaff(val staff: StaffDetail, val temporaryPassword: String?)

/** `POST /staff/:id/status`. RESIGNED / TERMINATED disable the login and end all assignments. */
data class StaffStatusChange(val status: String, val effectiveDate: String, val reason: String)
