package com.schoolapp.feature.admin.users.assignments

import androidx.compose.runtime.Immutable
import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.users.UsersRepository
import com.schoolapp.feature.admin.common.AdminNotice
import com.schoolapp.feature.admin.common.AdminNotices
import com.schoolapp.feature.admin.users.UserPermissions
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@Immutable
data class AddAssignmentUiState(
    val userName: String = "",
    val isLoading: Boolean = true,
    val loadError: AppError? = null,
    val options: AssignmentOptions = AssignmentOptions(),
    val draft: AssignmentDraft = AssignmentDraft(),
    val problems: Set<AssignmentProblem> = emptySet(),
    val showErrors: Boolean = false,
    val isSaving: Boolean = false,
    val saveError: AppError? = null,
    val saved: Boolean = false,
)

/** "Assign a role to {name}": one role + scope + optional end date. */
@HiltViewModel
class AddAssignmentViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val repository: UsersRepository,
    private val authRepository: AuthRepository,
    private val loader: AssignmentOptionsLoader,
    private val notices: AdminNotices,
) : ViewModel() {

    private val userId: String = checkNotNull(savedStateHandle["userId"])
    private val _uiState = MutableStateFlow(AddAssignmentUiState(userName = savedStateHandle["userName"] ?: ""))
    val uiState: StateFlow<AddAssignmentUiState> = _uiState.asStateFlow()

    init {
        load()
    }

    fun load() {
        _uiState.update { it.copy(isLoading = true, loadError = null) }
        viewModelScope.launch {
            when (val result = loader.load(UserPermissions.of(authRepository.session.first()))) {
                is AppResult.Success -> _uiState.update { it.copy(isLoading = false, options = result.data) }
                is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, loadError = result.error) }
            }
        }
    }

    fun onDraftChange(draft: AssignmentDraft) = _uiState.update {
        it.copy(draft = draft, problems = if (it.showErrors) draft.problems(today()) else emptySet(), saveError = null)
    }

    fun save() {
        val state = _uiState.value
        if (state.isSaving) return
        val problems = state.draft.problems(today())
        _uiState.update { it.copy(showErrors = true, problems = problems) }
        if (problems.isNotEmpty()) return
        _uiState.update { it.copy(isSaving = true, saveError = null) }
        viewModelScope.launch {
            when (val result = repository.addAssignment(userId, state.draft.toRequest())) {
                is AppResult.Success -> {
                    notices.post(AdminNotice(AdminNotice.Kind.ROLE_ASSIGNED, state.userName))
                    _uiState.update { it.copy(isSaving = false, saved = true) }
                }
                is AppResult.Failure -> _uiState.update { it.copy(isSaving = false, saveError = result.error) }
            }
        }
    }
}
