package com.schoolapp.feature.fees.components

import androidx.compose.runtime.Composable
import androidx.compose.runtime.Immutable
import androidx.compose.ui.Modifier
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.people.StudentsRepository
import com.schoolapp.core.model.people.StudentSummary
import com.schoolapp.feature.fees.record.components.StudentPicker
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

@Immutable
data class StudentSearchState(
    val search: String = "",
    val results: List<StudentSummary> = emptyList(),
    val isSearching: Boolean = false,
    val error: AppError? = null,
    val selected: StudentSummary? = null,
)

/** Debounced student search by name or admission number for fee forms; lives in a ViewModel [scope]. */
class StudentSearch(private val repository: StudentsRepository, private val scope: CoroutineScope) {
    private val _state = MutableStateFlow(StudentSearchState())
    val state: StateFlow<StudentSearchState> = _state.asStateFlow()
    private var job: Job? = null

    fun onSearch(text: String) {
        _state.update { it.copy(search = text, error = null) }
        job?.cancel()
        val query = text.trim()
        if (query.length < MIN_QUERY) {
            _state.update { it.copy(results = emptyList(), isSearching = false) }
            return
        }
        job = scope.launch {
            delay(DEBOUNCE_MS)
            _state.update { it.copy(isSearching = true) }
            val result = repository.students(search = query)
            _state.update {
                when (result) {
                    is AppResult.Success -> it.copy(isSearching = false, results = result.data.take(MAX_RESULTS))
                    is AppResult.Failure -> it.copy(isSearching = false, error = result.error)
                }
            }
        }
    }

    fun select(student: StudentSummary) {
        job?.cancel()
        _state.update { StudentSearchState(selected = student) }
    }

    fun clear() = _state.update { StudentSearchState() }

    private companion object {
        const val MIN_QUERY = 2
        const val DEBOUNCE_MS = 300L
        const val MAX_RESULTS = 20
    }
}

/** [StudentPicker] bound to a [StudentSearch]. */
@Composable
internal fun StudentSearchPicker(
    state: StudentSearchState,
    search: StudentSearch,
    showRequired: Boolean,
    enabled: Boolean,
    modifier: Modifier = Modifier,
) {
    StudentPicker(
        selected = state.selected,
        search = state.search,
        results = state.results,
        isSearching = state.isSearching,
        searchError = state.error,
        showRequired = showRequired,
        enabled = enabled,
        onSearchChange = search::onSearch,
        onSelect = search::select,
        onClear = search::clear,
        modifier = modifier,
    )
}
