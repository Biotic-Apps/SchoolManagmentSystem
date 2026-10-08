package com.schoolapp.core.data.academics

import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import javax.inject.Inject
import javax.inject.Singleton

/**
 * "Something about classes, sections, subjects or timetables changed": screens still on the back stack
 * (Classes overview, timetable section list) reload when an edit screen saves.
 */
@Singleton
class AcademicsEvents @Inject constructor() {
    private val _changes = MutableSharedFlow<Unit>(extraBufferCapacity = 1)
    val changes: SharedFlow<Unit> = _changes.asSharedFlow()

    fun changed() {
        _changes.tryEmit(Unit)
    }
}
