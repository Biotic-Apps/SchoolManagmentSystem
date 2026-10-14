package com.schoolapp.core.model.admissions

enum class ApplicationStatus {
    SUBMITTED, DOCUMENTS_PENDING, TEST_SCHEDULED, TEST_COMPLETED, OFFERED, WAITLISTED, REJECTED,
    CONFIRMED, ENROLLED, EXPIRED, WITHDRAWN, UNKNOWN,
    ;

    /** Offer, waitlist or reject is still possible; the form can still be edited. */
    val isDecidable: Boolean get() = this in DECIDABLE

    /** Still in the pipeline: can be withdrawn and get documents. */
    val isOpen: Boolean get() = this in OPEN

    /** The entrance test can be (re)scheduled. */
    val canScheduleTest: Boolean get() = this in TEST_SCHEDULABLE

    companion object {
        private val DECIDABLE = setOf(SUBMITTED, DOCUMENTS_PENDING, TEST_SCHEDULED, TEST_COMPLETED)
        private val OPEN = DECIDABLE + setOf(OFFERED, WAITLISTED)
        private val TEST_SCHEDULABLE = setOf(SUBMITTED, DOCUMENTS_PENDING, TEST_SCHEDULED)

        fun fromKey(key: String?): ApplicationStatus = entries.firstOrNull { it.name == key } ?: UNKNOWN
    }
}
