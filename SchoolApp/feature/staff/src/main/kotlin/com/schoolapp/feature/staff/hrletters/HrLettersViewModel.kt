package com.schoolapp.feature.staff.hrletters

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.staff.hrletters.HrLettersRepository
import com.schoolapp.core.model.SessionContext
import com.schoolapp.core.model.staff.hrletters.HrLetterTemplate
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.async
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** One staff member's HR letters plus the active templates used by "Generate letter". */
@HiltViewModel
class HrLettersViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val authRepository: AuthRepository,
    private val repository: HrLettersRepository,
) : ViewModel() {

    private val staffId: String = checkNotNull(savedStateHandle["id"]) { "Staff id missing" }
    private val _uiState = MutableStateFlow(HrLettersUiState())
    val uiState: StateFlow<HrLettersUiState> = _uiState.asStateFlow()
    private var loadJob: Job? = null

    init {
        load()
    }

    fun retry() {
        _uiState.update { it.copy(isLoading = true, error = null) }
        load()
    }

    fun refresh() {
        _uiState.update { it.copy(isRefreshing = true) }
        load()
    }

    fun openForm() = _uiState.update { if (it.templates.isEmpty()) it else it.copy(form = GenerateLetterForm(), generated = false) }

    fun dismissForm() = _uiState.update { if (it.form?.isSaving == true) it else it.copy(form = null) }

    fun onTemplateChange(id: String) = updateForm { it.copy(templateId = id, templateMissing = false, serverErrors = it.serverErrors - "templateId") }

    fun onSubjectChange(value: String) = updateForm { it.copy(subject = value, subjectError = null, serverErrors = it.serverErrors - "subject") }

    fun onEffectiveDateChange(value: String?) = updateForm { it.copy(effectiveDate = value, serverErrors = it.serverErrors - "effectiveDate") }

    fun submit() {
        val form = _uiState.value.form?.validated() ?: return
        if (form.isSaving) return
        val input = form.toInput()
        if (!form.isValid || input == null) {
            updateForm { form }
            return
        }
        updateForm { form.copy(isSaving = true, error = null, serverErrors = emptyMap()) }
        viewModelScope.launch {
            val result = repository.generate(staffId, input)
            _uiState.update { state ->
                when (result) {
                    is AppResult.Success -> state.copy(
                        form = null,
                        generated = true,
                        letters = listOf(result.data) + state.letters.filterNot { it.id == result.data.id },
                    )
                    is AppResult.Failure -> state.form?.let {
                        val fields = (result.error as? AppError.Validation)?.fields.orEmpty().filterKeys { key -> key in FORM_FIELDS }
                        state.copy(form = it.copy(isSaving = false, error = result.error.takeIf { fields.isEmpty() }, serverErrors = fields))
                    } ?: state
                }
            }
        }
    }

    fun consumeGenerated() = _uiState.update { it.copy(generated = false) }

    /** Fetches a freshly signed link (`GET hr-letters/:id/download`) and hands it to the viewer. */
    fun download(letterId: String) {
        if (_uiState.value.openingId != null) return
        _uiState.update { it.copy(openingId = letterId, actionError = null) }
        viewModelScope.launch {
            val result = repository.downloadUrl(letterId)
            _uiState.update { state ->
                when (result) {
                    is AppResult.Success -> state.copy(openingId = null, openUrl = result.data)
                    is AppResult.Failure -> state.copy(openingId = null, actionError = result.error)
                }
            }
        }
    }

    fun onUrlOpened() = _uiState.update { it.copy(openUrl = null) }

    fun consumeActionError() = _uiState.update { it.copy(actionError = null) }

    private fun load() {
        loadJob?.cancel()
        loadJob = viewModelScope.launch {
            val templates = async { loadTemplates() }
            val letters = repository.letters(staffId)
            val templateList = templates.await()
            _uiState.update { state ->
                when (letters) {
                    is AppResult.Success -> state.copy(
                        isLoading = false, isRefreshing = false, error = null,
                        letters = letters.data.sortedByDescending { it.issuedAt },
                        templates = templateList ?: state.templates,
                    )
                    is AppResult.Failure -> if (state.isLoading || state.letters.isEmpty()) {
                        state.copy(isLoading = false, isRefreshing = false, error = letters.error)
                    } else {
                        state.copy(isRefreshing = false, actionError = letters.error)
                    }
                }
            }
        }
    }

    /** Null on failure: the list still shows, only the Generate button stays hidden. */
    private suspend fun loadTemplates(): List<HrLetterTemplate>? {
        val schoolId = authRepository.session.filterNotNull().first().schoolId() ?: return emptyList()
        return (repository.templates(schoolId) as? AppResult.Success)?.data
    }

    private fun SessionContext.schoolId(): String? =
        activeAssignments.firstNotNullOfOrNull { it.schoolId } ?: assignments.firstNotNullOfOrNull { it.schoolId }

    private fun updateForm(transform: (GenerateLetterForm) -> GenerateLetterForm) =
        _uiState.update { state -> state.form?.let { state.copy(form = transform(it)) } ?: state }

    private companion object {
        val FORM_FIELDS = setOf("templateId", "subject", "effectiveDate")
    }
}
