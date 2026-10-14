package com.schoolapp.feature.admissions.enquiries

import androidx.compose.runtime.Immutable
import com.schoolapp.core.model.admissions.EnquiryInput

enum class EnquiryField { CHILD_NAME, CLASS, GUARDIAN_NAME, PHONE, EMAIL }

/** Typed text of the "Add enquiry" form (walk-in or phone enquiry). */
@Immutable
data class EnquiryDraft(
    val childName: String = "",
    val classId: String? = null,
    val dob: String = "",
    val guardianName: String = "",
    val phone: String = "",
    val email: String = "",
    val source: String = "",
    val followUpDate: String = "",
    val notes: String = "",
) {
    /** Same rules as the web form and the API DTO. */
    fun problems(): Set<EnquiryField> = buildSet {
        if (childName.trim().length !in 2..120) add(EnquiryField.CHILD_NAME)
        if (classId == null) add(EnquiryField.CLASS)
        if (guardianName.trim().length !in 2..100) add(EnquiryField.GUARDIAN_NAME)
        if (!PHONE.matches(phone.trim())) add(EnquiryField.PHONE)
        if (email.isNotBlank() && !EMAIL.matches(email.trim())) add(EnquiryField.EMAIL)
    }

    fun toInput(branchId: String, sessionId: String) = EnquiryInput(
        branchId = branchId,
        sessionId = sessionId,
        classId = classId.orEmpty(),
        childName = childName,
        dob = dob,
        guardianName = guardianName,
        phone = phone,
        email = email,
        source = source,
        notes = notes,
        followUpDate = followUpDate,
    )

    companion object {
        private val PHONE = Regex("""^\+?[0-9\s-]{7,20}$""")
        private val EMAIL = Regex("""^[^\s@]+@[^\s@]+\.[^\s@]+$""")
        const val SOURCE_MAX = 60
        const val NOTES_MAX = 2000
    }
}
