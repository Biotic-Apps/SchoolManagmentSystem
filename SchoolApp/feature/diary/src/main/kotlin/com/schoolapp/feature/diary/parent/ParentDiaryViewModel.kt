package com.schoolapp.feature.diary.parent

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.diary.DiaryRepository
import com.schoolapp.core.data.people.StudentsRepository
import com.schoolapp.core.model.ChildSummary
import com.schoolapp.core.model.diary.DiaryEntry
import com.schoolapp.core.model.diary.DiaryStatus
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Parent feed: the active child's published diary for the last [DAYS] days, newest day first. */
@HiltViewModel
class ParentDiaryViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    private val studentsRepository: StudentsRepository,
    private val diaryRepository: DiaryRepository,
    private val clock: AppClock,
) : ViewModel() {

    private val _uiState = MutableStateFlow(ParentDiaryUiState())
    val uiState: StateFlow<ParentDiaryUiState> = _uiState.asStateFlow()

    private var refreshJob: Job? = null

    init {
        viewModelScope.launch {
            authRepository.session.filterNotNull()
                .map { it.activeChild }
                .distinctUntilChanged { old, new -> old?.id == new?.id }
                .collectLatest { child ->
                    refreshJob?.cancel()
                    _uiState.value = ParentDiaryUiState(isLoading = true, childId = child?.id, childName = child?.fullName)
                    load(child)
                }
        }
    }

    fun refresh() {
        refreshJob?.cancel()
        refreshJob = viewModelScope.launch {
            _uiState.update { it.copy(isRefreshing = true, isLoading = it.error != null, error = null) }
            load(authRepository.session.first()?.activeChild)
        }
    }

    private suspend fun load(child: ChildSummary?) {
        if (child == null) return _uiState.update { it.copy(isLoading = false, isRefreshing = false) }
        val sectionId = when (val student = studentsRepository.student(child.id)) {
            is AppResult.Failure -> return fail(student)
            is AppResult.Success -> student.data.summary.sectionId
        }
        if (sectionId == null) {
            return _uiState.update { it.copy(isLoading = false, isRefreshing = false, noSection = true, days = emptyList()) }
        }
        val today = clock.now().toLocalDate()
        val from = today.minusDays(DAYS - 1).toString()
        when (val result = diaryRepository.entries(sectionId, from = from, to = today.toString())) {
            is AppResult.Failure -> fail(result)
            is AppResult.Success -> _uiState.update {
                it.copy(isLoading = false, isRefreshing = false, noSection = false, error = null, days = group(result.data))
            }
        }
    }

    private fun fail(result: AppResult.Failure) =
        _uiState.update { it.copy(isLoading = false, isRefreshing = false, error = result.error) }

    private fun group(entries: List<DiaryEntry>): List<DiaryDay> = entries
        .filter { it.status == DiaryStatus.PUBLISHED }
        .groupBy { it.date }
        .toSortedMap(compareByDescending { it })
        .map { (date, list) -> DiaryDay(date, list.sortedBy { it.subjectName.orEmpty().lowercase() }) }

    private companion object {
        const val DAYS = 14L
    }
}
