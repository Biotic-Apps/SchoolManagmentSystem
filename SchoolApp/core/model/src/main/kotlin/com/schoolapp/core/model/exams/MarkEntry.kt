package com.schoolapp.core.model.exams

/** One row sent with `PUT /mark-sheets/:id`; [marks] null = still pending. */
data class MarkEntry(val studentId: String, val marks: Double?, val absent: Boolean, val remark: String? = null)

/**
 * A mark sheet as opened on this device: [localEntries] are marks saved here but still queued for the server
 * (null when none); [offline] when the server copy could not be refreshed.
 */
data class LoadedMarkSheet(val sheet: MarkSheet, val localEntries: List<MarkEntry>?, val offline: Boolean = false)
