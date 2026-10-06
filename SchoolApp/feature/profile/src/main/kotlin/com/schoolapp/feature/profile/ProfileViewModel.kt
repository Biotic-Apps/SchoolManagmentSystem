package com.schoolapp.feature.profile

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.profile.ProfileRepository
import com.schoolapp.core.model.SessionContext
import com.schoolapp.core.model.profile.ProfileUpdate
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ProfileViewModel @Inject constructor(
    authRepository: AuthRepository,
    private val profileRepository: ProfileRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(ProfileUiState())
    val uiState: StateFlow<ProfileUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            authRepository.session.filterNotNull().collect(::applySession)
        }
    }

    fun onNameChange(value: String) = edit { it.copy(form = it.form.copy(name = value), nameError = null) }

    fun onEmailChange(value: String) = edit { it.copy(form = it.form.copy(email = value), emailError = null) }

    fun onPhoneChange(value: String) = edit { it.copy(form = it.form.copy(phone = value), phoneError = null) }

    fun onSave() {
        val current = _uiState.value
        if (current.isSaving || !current.hasChanges) return
        val check = ProfileValidator.validate(current.form)
        if (!check.isValid) {
            _uiState.update { it.copy(nameError = check.name, emailError = check.email, phoneError = check.phone) }
            return
        }
        val form = current.form.trimmed()
        val update = ProfileUpdate(
            name = form.name.takeIf { it != current.original.name },
            email = form.email.takeIf { it != current.original.email },
            phone = form.phone.takeIf { it != current.original.phone },
        )
        _uiState.update { it.copy(isSaving = true, saveError = null, saved = false) }
        viewModelScope.launch {
            when (val result = profileRepository.updateProfile(update)) {
                is AppResult.Success -> _uiState.update {
                    it.copy(isSaving = false, saved = true, original = form, form = form)
                }
                is AppResult.Failure -> _uiState.update { it.copy(isSaving = false, saveError = result.error) }
            }
        }
    }

    private fun edit(transform: (ProfileUiState) -> ProfileUiState) =
        _uiState.update { transform(it).copy(saved = false, saveError = null) }

    private fun applySession(session: SessionContext) {
        val fields = ProfileFields(session.user.fullName, session.user.email.orEmpty(), session.user.phone.orEmpty())
        val roles = session.assignments.map { a ->
            RoleSummary(a.role, a.roleName, a.branchName ?: a.schoolName)
        }
        _uiState.update { state ->
            val keepEdits = !state.isLoading && state.hasChanges
            state.copy(
                isLoading = false,
                original = fields,
                form = if (keepEdits) state.form else fields,
                roles = roles,
                twoFactorEnabled = session.user.twoFactorEnabled,
            )
        }
    }
}
