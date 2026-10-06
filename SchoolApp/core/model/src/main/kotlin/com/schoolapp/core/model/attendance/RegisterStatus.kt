package com.schoolapp.core.model.attendance

/** UNMARKED (none yet) -> DRAFT -> SUBMITTED -> LOCKED; PENDING_REVIEW while a probation review is open. */
enum class RegisterStatus {
    UNMARKED,
    DRAFT,
    SUBMITTED,
    LOCKED,
    PENDING_REVIEW,
    ;

    val isFinal: Boolean get() = this == SUBMITTED || this == LOCKED || this == PENDING_REVIEW

    companion object {
        fun fromKey(key: String?): RegisterStatus = entries.firstOrNull { it.name == key } ?: UNMARKED
    }
}
