package com.schoolapp.core.model.attendance

/**
 * Register as shown to the marker. [localMarks] holds unsent marks saved on this device (draft or
 * queued submit); [offline] means the server was unreachable and the roster came from the device cache.
 */
data class LoadedRegister(
    val register: AttendanceRegister,
    val localMarks: List<EntryMark>? = null,
    val offline: Boolean = false,
)
