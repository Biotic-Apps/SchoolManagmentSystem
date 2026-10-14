package com.schoolapp.feature.admin.schools.detail

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.schools.SchoolsRepository
import com.schoolapp.feature.admin.common.AdminNotice
import com.schoolapp.feature.admin.common.AdminNotices
import com.schoolapp.feature.admin.schools.SchoolPermissions
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.drop
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** One school with archive / restore; edit and permanent delete open their own screens. */
@HiltViewModel
class SchoolDetailViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val repository: SchoolsRepository,
    authRepository: AuthRepository,
    private val notices: AdminNotices,
) : ViewModel() {

    private val schoolId: String = checkNotNull(savedStateHandle["schoolId"])
    private val _uiState = MutableStateFlow(SchoolDetailUiState())
    val uiState: StateFlow<SchoolDetailUiState> = _uiState.asStateFlow()
    val notice: StateFlow<AdminNotice?> = notices.notice

    private var loadJob: Job? = null

    init {
        viewModelScope.launch {
            authRepository.session.map(SchoolPermissions::of).distinctUntilChanged().collect { permissions ->
                _uiState.update { it.copy(permissions = permissions) }
            }
        }
        viewModelScope.launch { repository.changes.drop(1).collect { load(quiet = true) } }
        load(quiet = false)
    }

    fun retry() = load(quiet = false)

    fun refresh() {
        _uiState.update { it.copy(isRefreshing = true) }
        load(quiet = true)
    }

    fun consumeNotice(notice: AdminNotice) = notices.consume(notice)

    fun onToggleStatus() = _uiState.update { it.copy(confirmingStatus = true, actionError = null) }

    fun onDismissStatus() = _uiState.update { it.copy(confirmingStatus = false) }

    fun confirmStatus() {
        val school = _uiState.value.school ?: return
        if (_uiState.value.isChangingStatus) return
        _uiState.update { it.copy(confirmingStatus = false, isChangingStatus = true, actionError = null) }
        viewModelScope.launch {
            val archiving = school.isActive
            val result = if (archiving) repository.archive(school.id) else repository.activate(school.id)
            when (result) {
                is AppResult.Success -> {
                    _uiState.update { it.copy(isChangingStatus = false, school = result.data) }
                    val kind = if (archiving) AdminNotice.Kind.SCHOOL_ARCHIVED else AdminNotice.Kind.SCHOOL_RESTORED
                    notices.post(AdminNotice(kind, school.name))
                }
                is AppResult.Failure -> _uiState.update { it.copy(isChangingStatus = false, actionError = result.error) }
            }
        }
    }

    private fun load(quiet: Boolean) {
        loadJob?.cancel()
        if (!quiet) _uiState.update { it.copy(isLoading = it.school == null, error = null) }
        loadJob = viewModelScope.launch {
            val result = repository.school(schoolId)
            _uiState.update {
                val base = it.copy(isLoading = false, isRefreshing = false)
                when (result) {
                    is AppResult.Success -> base.copy(school = result.data, error = null)
                    is AppResult.Failure -> base.copy(error = result.error)
                }
            }
        }
    }
}
