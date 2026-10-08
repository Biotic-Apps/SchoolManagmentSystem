package com.schoolapp.feature.staff.form

import androidx.compose.runtime.Immutable
import com.schoolapp.core.model.staff.StaffDetail
import com.schoolapp.core.model.staff.StaffProfileInput

/** Raw text of the add / edit staff form, as typed. */
@Immutable
data class StaffForm(
    val name: String = "",
    val email: String = "",
    val phone: String = "",
    val employeeNo: String = "",
    val designation: String? = null,
    val joinDate: String? = null,
    val cnic: String = "",
    val qualification: String = "",
) {
    fun toProfileInput() = StaffProfileInput(
        name = name.trim(),
        email = email.trim().ifEmpty { null },
        phone = phone.trim().ifEmpty { null },
        employeeNo = employeeNo.trim().ifEmpty { null },
        designation = designation.orEmpty(),
        joinDate = joinDate.orEmpty(),
        cnic = cnic.trim().ifEmpty { null },
        qualification = qualification.trim().ifEmpty { null },
    )

    companion object {
        /** CNIC arrives masked, so it starts blank and blank keeps the one on file. */
        fun from(detail: StaffDetail) = StaffForm(
            name = detail.summary.name,
            email = detail.email.orEmpty(),
            phone = detail.phone.orEmpty(),
            employeeNo = detail.summary.employeeNo.orEmpty(),
            designation = detail.summary.designation,
            joinDate = detail.joinDate?.take(DATE_LENGTH),
            qualification = detail.qualification.orEmpty(),
        )

        private const val DATE_LENGTH = 10
    }
}

enum class StaffField { NAME, EMAIL, PHONE, EMPLOYEE_NO, DESIGNATION, JOIN_DATE, CNIC, QUALIFICATION, ROLE, BRANCH }

/** Why a field is invalid; the screen turns each into a string resource. */
enum class FieldProblem {
    REQUIRED,
    TOO_SHORT,
    TOO_LONG,
    INVALID_EMAIL,
    INVALID_PHONE,
    INVALID_CNIC,
    CONTACT_FOR_ACCOUNT,
    EMAIL_TAKEN,
    CONTACT_MISMATCH,
    EMPLOYEE_NO_TAKEN,
}
