package com.schoolapp.feature.organisation.setup

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.common.toActionError
import com.schoolapp.core.model.academics.ClassSetup
import com.schoolapp.core.ui.SaveTracker
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.update

/**
 * What the Class setup controllers share: the screen state, the view model scope, one save tracker for the
 * "All changes saved" indicator, and [afterSave] (silent reload + tell other screens).
 */
internal class SetupContext(
    val classId: String,
    val branchId: String,
    val sessionId: String?,
    val schoolId: String?,
    val state: MutableStateFlow<ClassSetupUiState>,
    val scope: CoroutineScope,
    val tracker: SaveTracker,
    val afterSave: suspend () -> Unit,
) {
    fun updateSetup(change: (ClassSetup) -> ClassSetup) =
        state.update { s -> s.copy(setup = s.setup?.let(change)) }

    /** Runs one tracked save; success reloads, failure shows the server's reason in the banner and reloads. */
    suspend fun <T> save(block: suspend () -> AppResult<T>): AppResult<T> {
        val result = tracker.track(block)
        if (result is AppResult.Failure) state.update { it.copy(banner = result.error.toActionError()) }
        afterSave()
        return result
    }
}
