package com.schoolapp.feature.syllabus.parent

import androidx.compose.runtime.Immutable
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.people.StudentsRepository
import com.schoolapp.core.data.syllabus.SyllabusRepository
import com.schoolapp.core.model.ChildSummary
import com.schoolapp.core.model.syllabus.BookList
import com.schoolapp.core.model.syllabus.SyllabusPlan
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.launch
import javax.inject.Inject

@Immutable
data class ParentSyllabusUiState(
    val isLoading: Boolean = true,
    val hasChild: Boolean = true,
    val bookList: BookList? = null,
    val plans: List<SyllabusPlan> = emptyList(),
    val error: AppError? = null,
)

/** Parent: approved book list and syllabus progress for the selected child's class and section. */
@HiltViewModel
class ParentSyllabusViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    private val studentsRepository: StudentsRepository,
    private val repository: SyllabusRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(ParentSyllabusUiState())
    val uiState: StateFlow<ParentSyllabusUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            authRepository.session.filterNotNull().map { it.activeChild }.distinctUntilChanged().collectLatest(::load)
        }
    }

    fun retry() {
        viewModelScope.launch { load(authRepository.session.first()?.activeChild) }
    }

    private suspend fun load(child: ChildSummary?) {
        if (child == null) {
            _uiState.value = ParentSyllabusUiState(isLoading = false, hasChild = false)
            return
        }
        _uiState.value = ParentSyllabusUiState(isLoading = true)
        val sectionId = when (val student = studentsRepository.student(child.id)) {
            is AppResult.Failure -> return fail(student.error)
            is AppResult.Success -> student.data.summary.sectionId ?: student.data.enrollment?.sectionId
        }
        _uiState.value = coroutineScope {
            val books = async { repository.bookLists() }
            val plans = async { repository.plans(sectionId = sectionId) }
            val bookResult = books.await()
            val planResult = plans.await()
            val error = (bookResult as? AppResult.Failure)?.error ?: (planResult as? AppResult.Failure)?.error
            if (error != null) {
                ParentSyllabusUiState(isLoading = false, error = error)
            } else {
                val lists = (bookResult as AppResult.Success).data
                ParentSyllabusUiState(
                    isLoading = false,
                    bookList = lists.firstOrNull { it.className == child.className } ?: lists.singleOrNull(),
                    plans = (planResult as AppResult.Success).data,
                )
            }
        }
    }

    private fun fail(error: AppError) {
        _uiState.value = ParentSyllabusUiState(isLoading = false, error = error)
    }
}
