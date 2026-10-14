package com.schoolapp.feature.admin.schools.setup.model

import androidx.annotation.StringRes

/** A field error: a local rule ([Local]) or a message the server sent ([Server]). */
sealed interface SetupError {
    data class Local(@StringRes val res: Int) : SetupError
    data class Server(val text: String) : SetupError
}

/** Field keys used by validation, server error mapping and the step screens. */
object SetupKeys {
    const val SCHOOL_NAME = "school.name"
    const val SCHOOL_CODE = "school.code"
    const val SCHOOL_PHONE = "school.phone"
    const val SCHOOL_EMAIL = "school.email"
    const val SCHOOL_WEBSITE = "school.website"
    const val SCHOOL_ADDRESS = "school.address"
    const val BRANCH_NAME = "branch.name"
    const val BRANCH_CODE = "branch.code"
    const val BRANCH_PHONE = "branch.phone"
    const val BRANCH_EMAIL = "branch.email"
    const val BRANCH_ADDRESS = "branch.address"
    const val OPENS_AT = "branch.opensAt"
    const val CLOSES_AT = "branch.closesAt"
    const val LOCK_AT = "branch.attendanceLockAt"
    const val STAFF_ARRIVES = "branch.staffArrivesAt"
    const val STAFF_LEAVES = "branch.staffLeavesAt"
    const val WORKING_DAYS = "branch.workingDays"
    const val PRINCIPAL_NAME = "principal.name"
    const val PRINCIPAL_EMAIL = "principal.email"
    const val PRINCIPAL_PHONE = "principal.phone"
    const val PRINCIPAL_PASSWORD = "principal.password"
    const val SESSION_NAME = "academics.sessionName"
    const val START_DATE = "academics.startDate"
    const val END_DATE = "academics.endDate"
    const val CLASSES = "academics.classes"
    const val BELL_START = "bell.startTime"
    const val BREAK_AFTER = "bell.breakAfter"

    /** "academics.classes.{index}" – a class row's name / sections problem. */
    fun classRow(index: Int) = "$CLASSES.$index"
}
