package com.schoolapp.feature.admin.users.form

import androidx.compose.runtime.Immutable
import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.users.UsersRepository
import com.schoolapp.core.model.users.UserContactUpdate
import com.schoolapp.feature.admin.common.AdminNotice
import com.schoolapp.feature.admin.common.AdminNotices
import com.schoolapp.feature.admin.common.FieldProblem
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@Immutable
data class EditUserUiState(
    val isLoading: Boolean = true,
    val loadError: AppError? = null,
    val canEdit: Boolean = true,
    val contact: UserContact = UserContact(),
    val errors: Map<UserField, FieldProblem> = emptyMap(),
    val serverErrors: Map<UserField, String> = emptyMap(),
    val isSaving: Boolean = false,
    val saveError: AppError? = null,
    val saved: Boolean = false,
    val isDirty: Boolean = false,
)

/** Edit a user's name, email and phone. */
@HiltViewModel
class EditUserViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val repository: UsersRepository,
    private val authRepository: AuthRepository,
    private val notices: AdminNotices,
) : ViewModel() {

    private val userId: String = checkNotNull(savedStateHandle["userId"])
    private val _uiState = MutableStateFlow(EditUserUiState())
    val uiState: StateFlow<EditUserUiState> = _uiState.asStateFlow()

    init {
        load()
    }

    fun load() {
        _uiState.update { it.copy(isLoading = true, loadError = null) }
        viewModelScope.launch {
            val canEdit = authRepository.session.first()?.has("users.edit") == true
            when (val result = repository.user(userId)) {
                is AppResult.Success -> _uiState.update {
                    val user = result.data.user
                    it.copy(isLoading = false, canEdit = canEdit, contact = UserContact(user.name, user.email.orEmpty(), user.phone.orEmpty()))
                }
                is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, canEdit = canEdit, loadError = result.error) }
            }
        }
    }

    fun onContactChange(contact: UserContact) = _uiState.update {
        val errors = if (it.errors.isEmpty()) it.errors else UserFormValidation.contact(contact)
        it.copy(contact = contact, errors = errors, serverErrors = emptyMap(), saveError = null, isDirty = true)
    }

    fun save() {
        val state = _uiState.value
        if (state.isSaving) return
        val errors = UserFormValidation.contact(state.contact)
        if (errors.isNotEmpty()) {
            _uiState.update { it.copy(errors = errors) }
            return
        }
        _uiState.update { it.copy(isSaving = true, saveError = null, errors = emptyMap()) }
        viewModelScope.launch {
            val contact = state.contact
            when (val result = repository.update(userId, UserContactUpdate(contact.name, contact.email, contact.phone))) {
                is AppResult.Success -> {
                    notices.post(AdminNotice(AdminNotice.Kind.USER_UPDATED, result.data.user.name))
                    _uiState.update { it.copy(isSaving = false, saved = true) }
                }
                is AppResult.Failure -> _uiState.update {
                    val fields = UserFormValidation.serverFields(result.error)
                    it.copy(isSaving = false, serverErrors = fields, saveError = result.error.takeIf { fields.isEmpty() })
                }
            }
        }
    }
}
