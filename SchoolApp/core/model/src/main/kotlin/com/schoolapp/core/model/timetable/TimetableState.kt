package com.schoolapp.core.model.timetable

/** Lifecycle of a section timetable; viewers without edit rights see EMPTY/DRAFT as "Not published yet". */
enum class TimetableState {
    EMPTY,
    DRAFT,
    PUBLISHED,
    PUBLISHED_WITH_CHANGES,
    ;

    val isPublished: Boolean get() = this == PUBLISHED || this == PUBLISHED_WITH_CHANGES

    companion object {
        fun parse(raw: String?): TimetableState? = entries.firstOrNull { it.name == raw }
    }
}
