package com.schoolapp.core.model.admissions

data class Enquiry(
    val id: String,
    val classId: String?,
    val className: String?,
    val childName: String,
    val dob: String?,
    val guardianName: String,
    val phone: String,
    val email: String?,
    val source: String?,
    val notes: String?,
    val followUpDate: String?,
    val status: EnquiryStatus,
    val applicationId: String?,
    val createdAt: String?,
)

enum class EnquiryStatus {
    NEW, CONTACTED, CONVERTED, CLOSED, UNKNOWN,
    ;

    /** Can still be converted into an application. */
    val isOpen: Boolean get() = this == NEW || this == CONTACTED

    companion object {
        /** Statuses a user may set by hand; CONVERTED only comes from converting. */
        val MANUAL = listOf(NEW, CONTACTED, CLOSED)

        fun fromKey(key: String?): EnquiryStatus = entries.firstOrNull { it.name == key } ?: UNKNOWN
    }
}
