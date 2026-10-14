package com.schoolapp.feature.students.loginslips

import androidx.compose.runtime.Immutable
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.common.ActionError
import com.schoolapp.core.data.common.toActionError
import com.schoolapp.core.data.guardians.GuardianAdminRepository
import com.schoolapp.core.model.guardians.LoginSlipPreview
import com.schoolapp.core.model.guardians.LoginSlipTarget
import com.schoolapp.feature.students.add.SectionOption
import com.schoolapp.feature.students.add.SectionOptionsLoader
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@Immutable
data class LoginSlipsUiState(
    val isLoading: Boolean = true,
    val loadError: AppError? = null,
    val branchId: String? = null,
    val sections: List<SectionOption> = emptyList(),
    /** "all", "class:<id>" or "section:<id>". */
    val target: String = ALL,
    val review: LoginSlipPreview? = null,
    val working: Boolean = false,
    val error: ActionError? = null,
    val fileUrl: String? = null,
) {
    companion object {
        const val ALL = "all"
    }
}

/** Bulk parent login slips (web PrintLoginSlipsDialog): pick whom, review the changes, then print the PDF. */
@HiltViewModel
class LoginSlipsViewModel @Inject constructor(
    private val repository: GuardianAdminRepository,
    private val sections: SectionOptionsLoader,
    private val authRepository: AuthRepository,
) : ViewModel() {
    private val _uiState = MutableStateFlow(LoginSlipsUiState())
    val uiState: StateFlow<LoginSlipsUiState> = _uiState.asStateFlow()
    private var job: Job? = null

    /** Called each time the sheet opens; [sectionId] preselects one section. */
    fun start(sectionId: String? = null) {
        job?.cancel()
        _uiState.value = LoginSlipsUiState(target = sectionId?.let { SECTION + it } ?: LoginSlipsUiState.ALL)
        viewModelScope.launch {
            val session = authRepository.session.filterNotNull().first()
            when (val result = sections.load(session)) {
                is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, loadError = result.error) }
                is AppResult.Success -> _uiState.update {
                    it.copy(isLoading = false, branchId = result.data.branchId.ifBlank { null }, sections = result.data.sections)
                }
            }
        }
    }

    fun onTarget(target: String) = _uiState.update { it.copy(target = target, review = null, fileUrl = null, error = null) }

    /** First press reviews; once reviewed, prints. */
    fun submit() {
        val s = _uiState.value
        if (s.working) return
        val target = s.toTarget()
        _uiState.update { it.copy(working = true, error = null, fileUrl = null) }
        job = viewModelScope.launch {
            if (s.review == null) {
                when (val result = repository.previewLoginSlips(target)) {
                    is AppResult.Success -> _uiState.update { it.copy(working = false, review = result.data) }
                    is AppResult.Failure -> _uiState.update { it.copy(working = false, error = result.error.toActionError()) }
                }
            } else {
                when (val result = repository.printLoginSlips(target)) {
                    is AppResult.Success -> _uiState.update { it.copy(working = false, review = null, fileUrl = result.data) }
                    is AppResult.Failure -> _uiState.update { it.copy(working = false, error = result.error.toActionError()) }
                }
            }
        }
    }

    private fun LoginSlipsUiState.toTarget(): LoginSlipTarget = when {
        target.startsWith(SECTION) -> LoginSlipTarget(branchId, sectionId = target.removePrefix(SECTION))
        target.startsWith(CLASS) -> LoginSlipTarget(branchId, classId = target.removePrefix(CLASS))
        else -> LoginSlipTarget(branchId)
    }

    internal companion object {
        const val CLASS = "class:"
        const val SECTION = "section:"
    }
}
