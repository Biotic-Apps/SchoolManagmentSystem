package com.schoolapp.feature.students.child

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.people.StudentsRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Parent's "Child Profile": always the child selected in the top-bar switcher, reloaded when it changes. */
@HiltViewModel
class ChildProfileViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    private val studentsRepository: StudentsRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(ChildProfileUiState())
    val uiState: StateFlow<ChildProfileUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            authRepository.session.filterNotNull()
                .map { it.activeChild?.id }
                .distinctUntilChanged()
                .collectLatest(::load)
        }
    }

    fun retry() {
        viewModelScope.launch { load(_uiState.value.childId) }
    }

    private suspend fun load(childId: String?) {
        if (childId == null) {
            _uiState.value = ChildProfileUiState(isLoading = false)
            return
        }
        _uiState.update { ChildProfileUiState(isLoading = true, childId = childId, detail = it.detail?.takeIf { d -> d.summary.id == childId }) }
        _uiState.value = when (val result = studentsRepository.student(childId)) {
            is AppResult.Success -> ChildProfileUiState(isLoading = false, childId = childId, detail = result.data)
            is AppResult.Failure -> ChildProfileUiState(isLoading = false, childId = childId, error = result.error)
        }
    }
}
