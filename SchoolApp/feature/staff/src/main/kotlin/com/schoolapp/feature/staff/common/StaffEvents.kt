package com.schoolapp.feature.staff.common

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import javax.inject.Inject
import javax.inject.Singleton

/** Bumped after any staff write so the list and detail reload without a pull-to-refresh. */
@Singleton
class StaffEvents @Inject constructor() {
    private val _changes = MutableStateFlow(0)
    val changes: StateFlow<Int> = _changes.asStateFlow()

    fun changed() = _changes.update { it + 1 }
}
