package com.schoolapp.core.model.setup

/**
 * The steps of `GET /setup/checklist`, in the order the card lists them. [countsRemaining] steps report
 * what is still left (allocation: section × subject pairs without a teacher), the rest count what exists.
 */
enum class SetupStep(val key: String, val countsRemaining: Boolean = false) {
    SESSION("session"),
    CLASSES("classes"),
    SUBJECTS("subjects"),
    BELL_SCHEDULE("bellSchedule"),
    TEACHERS("teachers"),
    ALLOCATION("allocation", countsRemaining = true),
    STUDENTS("students"),
    TIMETABLE("timetable"),
    FEE_PLAN("feePlan"),
    ;

    companion object {
        fun fromKey(key: String?): SetupStep? = entries.firstOrNull { it.key == key }
    }
}

data class SetupItem(val step: SetupStep, val done: Boolean, val count: Long)

/** A branch's setup progress; [complete] means nothing is left to do. */
data class SetupChecklist(val branchId: String?, val complete: Boolean, val items: List<SetupItem>)
