package com.schoolapp.feature.certificates.parent

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.certificates.CertificatesRepository
import com.schoolapp.core.model.certificates.CertificateInput
import com.schoolapp.core.model.certificates.CertificateType
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
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

/** Parent: the active child's certificate requests; reloads when the parent switches child. */
@HiltViewModel
class ParentCertificatesViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    private val repository: CertificatesRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(ParentCertificatesUiState())
    val uiState: StateFlow<ParentCertificatesUiState> = _uiState.asStateFlow()

    private var loadJob: Job? = null

    init {
        viewModelScope.launch {
            authRepository.session.filterNotNull()
                .map { session -> Triple(session.activeChild?.id, session.activeChild?.fullName, session.has(ADD_PERMISSION)) }
                .distinctUntilChanged()
                .collectLatest { (childId, childName, canRequest) ->
                    _uiState.update {
                        it.copy(
                            childId = childId, childName = childName, canRequest = canRequest,
                            certificates = emptyList(), form = null, requested = false,
                        )
                    }
                    load()
                }
        }
    }

    fun retry() = load()

    fun openForm() {
        val state = _uiState.value
        if (state.canRequest && state.childId != null) _uiState.update { it.copy(form = RequestForm(), requested = false) }
    }

    fun dismissForm() = _uiState.update { if (it.form?.isSaving == true) it else it.copy(form = null) }

    fun onTypeChange(type: CertificateType) = updateForm { it.copy(type = type, typeMissing = false) }

    fun onPurposeChange(purpose: String) = updateForm { it.copy(purpose = purpose) }

    fun onAchievementChange(text: String) = updateForm { it.copy(achievement = text, achievementMissing = false) }

    fun dismissRequested() = _uiState.update { it.copy(requested = false) }

    fun submit() {
        val state = _uiState.value
        val form = state.form ?: return
        val childId = state.childId ?: return
        if (form.isSaving) return
        val type = form.type
        val achievementMissing = type == CertificateType.ACHIEVEMENT && form.achievement.isBlank()
        if (type == null || achievementMissing) {
            updateForm { it.copy(typeMissing = type == null, achievementMissing = achievementMissing) }
            return
        }
        val achievement = form.achievement.trim().takeIf { type == CertificateType.ACHIEVEMENT }
        updateForm { it.copy(isSaving = true, error = null) }
        viewModelScope.launch {
            val result = repository.request(CertificateInput(childId, type, form.purpose.trim().ifEmpty { null }, achievement))
            _uiState.update { current ->
                when (result) {
                    is AppResult.Failure -> current.form?.let { current.copy(form = it.copy(isSaving = false, error = result.error)) } ?: current
                    is AppResult.Success -> if (current.childId != childId) {
                        current.copy(form = null)
                    } else {
                        current.copy(form = null, requested = true, certificates = listOf(result.data) + current.certificates)
                    }
                }
            }
        }
    }

    private fun load() {
        loadJob?.cancel()
        val childId = _uiState.value.childId
        if (childId == null) {
            _uiState.update { it.copy(isLoading = false, error = null) }
            return
        }
        _uiState.update { it.copy(isLoading = true, error = null) }
        loadJob = viewModelScope.launch {
            val result = repository.certificates(studentId = childId)
            _uiState.update { current ->
                if (current.childId != childId) return@update current
                when (result) {
                    is AppResult.Success -> current.copy(isLoading = false, certificates = result.data)
                    is AppResult.Failure -> current.copy(isLoading = false, error = result.error)
                }
            }
        }
    }

    private fun updateForm(transform: (RequestForm) -> RequestForm) =
        _uiState.update { state -> state.form?.let { state.copy(form = transform(it)) } ?: state }

    private companion object {
        const val ADD_PERMISSION = "certificates.add"
    }
}
