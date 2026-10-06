package com.schoolapp.feature.pickup.components

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.people.StudentsRepository
import com.schoolapp.core.model.people.StudentSummary
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Immutable
data class StudentSearchState(
    val query: String = "",
    val searching: Boolean = false,
    val searched: Boolean = false,
    val results: List<StudentSummary> = emptyList(),
    val error: AppError? = null,
)

/** Debounced `StudentsRepository.students(search)`; [publish] applies each state change in the owning ViewModel. */
internal class StudentSearch(
    private val scope: CoroutineScope,
    private val repository: StudentsRepository,
    private val publish: ((StudentSearchState) -> StudentSearchState) -> Unit,
) {
    private var job: Job? = null

    fun onQueryChange(query: String) {
        publish { it.copy(query = query) }
        job?.cancel()
        val term = query.trim()
        if (term.length < MIN_LENGTH) {
            publish { it.copy(searching = false, searched = false, results = emptyList(), error = null) }
            return
        }
        job = scope.launch {
            delay(DEBOUNCE_MS)
            publish { it.copy(searching = true, error = null) }
            val result = repository.students(search = term)
            publish { state ->
                when (result) {
                    is AppResult.Success -> state.copy(searching = false, searched = true, results = result.data)
                    is AppResult.Failure -> state.copy(searching = false, searched = true, results = emptyList(), error = result.error)
                }
            }
        }
    }

    fun clear() {
        job?.cancel()
        publish { StudentSearchState() }
    }

    private companion object {
        const val MIN_LENGTH = 2
        const val DEBOUNCE_MS = 300L
    }
}
