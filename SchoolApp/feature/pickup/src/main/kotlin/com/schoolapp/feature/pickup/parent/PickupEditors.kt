package com.schoolapp.feature.pickup.parent

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.pickup.EarlyLeaveInput
import com.schoolapp.core.model.pickup.PickupPersonInput

enum class PersonField { NAME, RELATION, PHONE, PHONE_FORMAT, CNIC_FORMAT }

/** "Add person" sheet. [photoUrl] previews the uploaded photo; [photoFileId] is what the API receives. */
@Immutable
data class AddPersonEditor(
    val name: String = "",
    val relation: String = "",
    val phone: String = "",
    val cnic: String = "",
    val photoFileId: String? = null,
    val photoUrl: String? = null,
    val photoUploading: Boolean = false,
    val errors: Set<PersonField> = emptySet(),
    val isSaving: Boolean = false,
    val error: AppError? = null,
) {
    fun validate(): Set<PersonField> = buildSet {
        if (name.isBlank()) add(PersonField.NAME)
        if (relation.isBlank()) add(PersonField.RELATION)
        when {
            phone.isBlank() -> add(PersonField.PHONE)
            !PHONE.matches(phone.trim()) -> add(PersonField.PHONE_FORMAT)
        }
        if (cnic.isNotBlank() && !CNIC.matches(cnic.trim())) add(PersonField.CNIC_FORMAT)
    }

    fun toInput() = PickupPersonInput(
        name = name.trim(),
        relation = relation.trim(),
        cnic = cnic.trim().ifBlank { null },
        phone = phone.trim(),
        photoFileId = photoFileId,
    )

    private companion object {
        val PHONE = Regex("^\\+?[0-9][0-9 -]{8,15}$")
        val CNIC = Regex("^\\d{5}-?\\d{7}-?\\d$")
    }
}

enum class LeaveField { DATE_PAST, TIME, REASON }

/** "Request early leave" sheet; [date] `YYYY-MM-DD`, [time] `HH:mm` (shown 12-hour). */
@Immutable
data class EarlyLeaveEditor(
    val date: String,
    val time: String? = null,
    val reason: String = "",
    val pickupPersonId: String? = null,
    val errors: Set<LeaveField> = emptySet(),
    val isSaving: Boolean = false,
    val error: AppError? = null,
) {
    /** Dates are ISO `YYYY-MM-DD`, so string order is date order. */
    fun validate(today: String): Set<LeaveField> = buildSet {
        if (date < today) add(LeaveField.DATE_PAST)
        if (time.isNullOrBlank()) add(LeaveField.TIME)
        if (reason.isBlank()) add(LeaveField.REASON)
    }

    fun toInput(studentId: String) = EarlyLeaveInput(studentId, date, time.orEmpty(), reason.trim(), pickupPersonId)
}
