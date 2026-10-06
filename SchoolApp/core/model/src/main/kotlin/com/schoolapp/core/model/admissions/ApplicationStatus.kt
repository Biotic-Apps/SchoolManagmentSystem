package com.schoolapp.core.model.admissions

enum class ApplicationStatus {
    SUBMITTED, DOCUMENTS_PENDING, TEST_SCHEDULED, TEST_COMPLETED, OFFERED, WAITLISTED, REJECTED,
    CONFIRMED, ENROLLED, EXPIRED, WITHDRAWN, UNKNOWN,
    ;

    /** Offer, waitlist or reject is still possible. */
    val isDecidable: Boolean get() = this in DECIDABLE

    companion object {
        private val DECIDABLE = setOf(SUBMITTED, DOCUMENTS_PENDING, TEST_SCHEDULED, TEST_COMPLETED)

        fun fromKey(key: String?): ApplicationStatus = entries.firstOrNull { it.name == key } ?: UNKNOWN
    }
}
