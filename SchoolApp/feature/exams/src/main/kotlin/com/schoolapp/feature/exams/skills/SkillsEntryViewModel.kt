package com.schoolapp.feature.exams.skills

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.exams.skills.SkillsRepository
import com.schoolapp.feature.exams.ExamPermissions
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Class teacher rates behaviour & skills of a section for one exam (printed on the report card). */
@HiltViewModel
class SkillsEntryViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val repository: SkillsRepository,
    private val authRepository: AuthRepository,
) : ViewModel() {

    private val examId: String = checkNotNull(savedStateHandle["examId"]) { "Exam id missing" }
    private val sectionId: String = checkNotNull(savedStateHandle["sectionId"]) { "Section id missing" }

    private val _uiState = MutableStateFlow(SkillsEntryUiState(title = savedStateHandle["title"] ?: ""))
    val uiState: StateFlow<SkillsEntryUiState> = _uiState.asStateFlow()

    init {
        load()
    }

    fun load() {
        _uiState.update { it.copy(isLoading = it.grid == null, error = null) }
        viewModelScope.launch {
            val session = authRepository.session.filterNotNull().first()
            _uiState.update { it.copy(canEdit = ExamPermissions.canEdit(session)) }
            when (val result = repository.grid(examId, sectionId)) {
                is AppResult.Success -> _uiState.update { it.copy(isLoading = false, grid = result.data, edits = emptyMap()) }
                is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, error = result.error) }
            }
        }
    }

    fun openStudent(studentId: String?) = _uiState.update { it.copy(openStudentId = studentId) }

    /** Tapping the selected level again clears it. */
    fun rate(studentId: String, itemId: String, value: Int) {
        val state = _uiState.value
        if (!state.editable || state.saving) return
        val next = if (state.valueOf(studentId, itemId) == value) null else value
        val saved = state.grid?.students?.firstOrNull { it.studentId == studentId }?.ratings?.get(itemId)
        val key = SkillsEntryUiState.cellKey(studentId, itemId)
        _uiState.update {
            it.copy(edits = if (next == saved) it.edits - key else it.edits + (key to next), saved = false, saveError = null)
        }
    }

    /** Gives every empty item of [studentId] the same level (quick start before adjusting). */
    fun fillStudent(studentId: String, value: Int) {
        val state = _uiState.value
        if (!state.editable) return
        val blanks = state.grid?.items.orEmpty().filter { state.valueOf(studentId, it.id) == null }
        _uiState.update { s -> s.copy(edits = s.edits + blanks.associate { SkillsEntryUiState.cellKey(studentId, it.id) to value }, saved = false) }
    }

    fun save() {
        val state = _uiState.value
        if (!state.editable || state.saving || state.edits.isEmpty()) return
        _uiState.update { it.copy(saving = true, saveError = null) }
        viewModelScope.launch {
            when (val result = repository.save(examId, sectionId, state.changes)) {
                is AppResult.Success -> _uiState.update { it.copy(saving = false, grid = result.data, edits = emptyMap(), saved = true) }
                is AppResult.Failure -> _uiState.update { it.copy(saving = false, saveError = result.error) }
            }
        }
    }
}
