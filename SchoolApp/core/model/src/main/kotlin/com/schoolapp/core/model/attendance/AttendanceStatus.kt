package com.schoolapp.core.model.attendance

enum class AttendanceStatus {
    PRESENT,
    ABSENT,
    LATE,
    LEAVE,
    HALF_DAY,
    ;

    /** Tap cycle on the roster: present -> absent -> late -> leave -> half day -> present. */
    fun next(): AttendanceStatus = entries[(ordinal + 1) % entries.size]

    companion object {
        fun fromKey(key: String?): AttendanceStatus? = entries.firstOrNull { it.name == key }
    }
}
