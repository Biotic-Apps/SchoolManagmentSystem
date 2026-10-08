package com.schoolapp.feature.staff.account

import androidx.compose.runtime.Immutable
import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.staff.StaffAdminRepository
import com.schoolapp.core.model.staff.StaffDetail
import com.schoolapp.core.model.staff.StaffOptions
import com.schoolapp.feature.staff.common.StaffEvents
import com.schoolapp.feature.staff.common.StaffPermissions
import com.schoolapp.feature.staff.form.FieldProblem
import com.schoolapp.feature.staff.form.StaffField
import com.schoolapp.feature.staff.form.StaffFormValidation
import com.schoolapp.feature.staff.form.StaffServerErrors
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@Immutable
data class CreateAccountForm(
    val email: String,
    val phone: String,
    val roleKey: String,
    val errors: Map<StaffField, FieldProblem> = emptyMap(),
    val isSaving: Boolean = false,
    val error: AppError? = null,
)

/** A password to show once; [signIn] is the email or phone they use. Null password = existing login linked. */
data class IssuedPassword(val name: String, val signIn: String?, val password: String?)

@Immutable
data class StaffAccountUiState(
    val canCreate: Boolean = false,
    val canReset: Boolean = false,
    val createForm: CreateAccountForm? = null,
    val confirmReset: Boolean = false,
    val isResetting: Boolean = false,
    val resetError: AppError? = null,
    val issued: IssuedPassword? = null,
)

/** "Create sign-in" for staff without a login and "Reset password", like the web staff profile. */
@HiltViewModel
class StaffAccountViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val repository: StaffAdminRepository,
    authRepository: AuthRepository,
    private val events: StaffEvents,
) : ViewModel() {

    private val staffId: String = checkNotNull(savedStateHandle["id"]) { "Staff id missing" }

    private val _uiState = MutableStateFlow(StaffAccountUiState())
    val uiState: StateFlow<StaffAccountUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            authRepository.session.collect { session ->
                val canEdit = StaffPermissions.canEdit(session)
                _uiState.update {
                    it.copy(canCreate = canEdit && session?.has(USERS_ADD) == true, canReset = canEdit && session?.has(USERS_EDIT) == true)
                }
            }
        }
    }

    fun openCreate(detail: StaffDetail) = _uiState.update {
        it.copy(
            createForm = CreateAccountForm(
                email = detail.email.orEmpty(),
                phone = detail.phone.orEmpty(),
                roleKey = StaffOptions.defaultRoleFor(detail.summary.designation),
            ),
        )
    }

    fun onCreateChange(form: CreateAccountForm) = _uiState.update { it.copy(createForm = form.copy(errors = emptyMap(), error = null)) }

    fun dismissCreate() = _uiState.update { if (it.createForm?.isSaving == true) it else it.copy(createForm = null) }

    fun submitCreate(name: String) {
        val form = _uiState.value.createForm ?: return
        if (form.isSaving) return
        val errors = StaffFormValidation.validateContact(form.email, form.phone, required = true)
        if (errors.isNotEmpty()) return _uiState.update { it.copy(createForm = form.copy(errors = errors)) }
        _uiState.update { it.copy(createForm = form.copy(isSaving = true, error = null)) }
        viewModelScope.launch {
            when (val result = repository.createAccount(staffId, form.email, form.phone, form.roleKey)) {
                is AppResult.Failure -> _uiState.update {
                    it.copy(createForm = form.copy(isSaving = false, error = result.error, errors = StaffServerErrors.fieldsFor(result.error)))
                }
                is AppResult.Success -> {
                    val login = result.data
                    _uiState.update {
                        it.copy(createForm = null, issued = IssuedPassword(name, listOf(login.email, login.phone).firstOrNull { !it.isNullOrBlank() }, login.temporaryPassword))
                    }
                    events.changed()
                }
            }
        }
    }

    fun askReset() = _uiState.update { it.copy(confirmReset = true, resetError = null) }

    fun cancelReset() = _uiState.update { if (it.isResetting) it else it.copy(confirmReset = false) }

    fun confirmReset(name: String, signIn: String?) {
        if (_uiState.value.isResetting) return
        _uiState.update { it.copy(isResetting = true, resetError = null) }
        viewModelScope.launch {
            when (val result = repository.resetPassword(staffId)) {
                is AppResult.Failure -> _uiState.update { it.copy(isResetting = false, confirmReset = false, resetError = result.error) }
                is AppResult.Success -> _uiState.update {
                    it.copy(isResetting = false, confirmReset = false, issued = IssuedPassword(name, signIn, result.data.temporaryPassword))
                }
            }
        }
    }

    fun dismissResetError() = _uiState.update { it.copy(resetError = null) }

    fun closeIssued() = _uiState.update { it.copy(issued = null) }

    private companion object {
        const val USERS_ADD = "users.add"
        const val USERS_EDIT = "users.edit"
    }
}
