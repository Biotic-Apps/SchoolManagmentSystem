package com.schoolapp.feature.exams.templates

import androidx.compose.runtime.Immutable
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.exams.templates.ReportCardTemplatesRepository
import com.schoolapp.core.model.exams.templates.ReportCardTemplate
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

enum class TemplateMessage { CREATED, UPDATED, DELETED, DEFAULT_SET }

@Immutable
data class TemplateForm(
    val template: ReportCardTemplate,
    val nameMissing: Boolean = false,
    val isSaving: Boolean = false,
    val error: AppError? = null,
)

@Immutable
data class TemplatesUiState(
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val error: AppError? = null,
    val templates: List<ReportCardTemplate> = emptyList(),
    val canAdd: Boolean = false,
    val canEdit: Boolean = false,
    val canDelete: Boolean = false,
    val form: TemplateForm? = null,
    val confirmDeleteId: String? = null,
    val busyId: String? = null,
    val actionError: AppError? = null,
    val message: TemplateMessage? = null,
)

/** Report card templates (web exams/report-card-templates): list, create, edit, delete, set default. */
@HiltViewModel
class TemplatesViewModel @Inject constructor(
    private val repository: ReportCardTemplatesRepository,
    authRepository: AuthRepository,
) : ViewModel() {

    private val _state = MutableStateFlow(TemplatesUiState())
    val state: StateFlow<TemplatesUiState> = _state.asStateFlow()

    init {
        viewModelScope.launch {
            val session = authRepository.session.filterNotNull().first()
            _state.update { it.copy(canAdd = session.has("exams.add"), canEdit = session.has("exams.edit"), canDelete = session.has("exams.delete")) }
        }
        load(refreshing = false)
    }

    fun retry() = load(refreshing = false)

    fun refresh() = load(refreshing = true)

    fun openNew() = _state.update { if (it.canAdd) it.copy(form = TemplateForm(ReportCardTemplate(name = "")), message = null) else it }

    fun openEdit(template: ReportCardTemplate) = _state.update { if (it.canEdit) it.copy(form = TemplateForm(template), message = null) else it }

    fun dismissForm() = _state.update { if (it.form?.isSaving == true) it else it.copy(form = null) }

    fun edit(transform: (ReportCardTemplate) -> ReportCardTemplate) = _state.update { state ->
        state.form?.let { state.copy(form = it.copy(template = transform(it.template), nameMissing = false)) } ?: state
    }

    fun save() {
        val form = _state.value.form ?: return
        if (form.isSaving) return
        if (form.template.name.isBlank()) return _state.update { it.copy(form = form.copy(nameMissing = true)) }
        _state.update { it.copy(form = form.copy(isSaving = true, error = null)) }
        viewModelScope.launch {
            val creating = form.template.id.isBlank()
            when (val result = repository.save(form.template)) {
                is AppResult.Failure -> _state.update { it.copy(form = it.form?.copy(isSaving = false, error = result.error)) }
                is AppResult.Success -> {
                    _state.update { it.copy(form = null, message = if (creating) TemplateMessage.CREATED else TemplateMessage.UPDATED) }
                    load(refreshing = false, quiet = true)
                }
            }
        }
    }

    fun requestDelete(id: String) = _state.update { it.copy(confirmDeleteId = id) }

    fun dismissDelete() = _state.update { it.copy(confirmDeleteId = null) }

    fun delete() {
        val id = _state.value.confirmDeleteId ?: return
        _state.update { it.copy(confirmDeleteId = null, busyId = id, actionError = null, message = null) }
        viewModelScope.launch {
            when (val result = repository.delete(id)) {
                is AppResult.Failure -> _state.update { it.copy(busyId = null, actionError = result.error) }
                is AppResult.Success -> _state.update {
                    it.copy(busyId = null, templates = it.templates.filterNot { t -> t.id == id }, message = TemplateMessage.DELETED)
                }
            }
        }
    }

    fun setDefault(id: String) {
        if (_state.value.busyId != null) return
        _state.update { it.copy(busyId = id, actionError = null, message = null) }
        viewModelScope.launch {
            when (val result = repository.setDefault(id)) {
                is AppResult.Failure -> _state.update { it.copy(busyId = null, actionError = result.error) }
                is AppResult.Success -> {
                    _state.update { it.copy(busyId = null, message = TemplateMessage.DEFAULT_SET) }
                    load(refreshing = false, quiet = true)
                }
            }
        }
    }

    private fun load(refreshing: Boolean, quiet: Boolean = false) {
        _state.update { it.copy(isLoading = !refreshing && !quiet && it.templates.isEmpty(), isRefreshing = refreshing, error = null) }
        viewModelScope.launch {
            when (val result = repository.templates()) {
                is AppResult.Success -> _state.update { it.copy(isLoading = false, isRefreshing = false, templates = result.data) }
                is AppResult.Failure -> _state.update {
                    if (it.templates.isNotEmpty()) it.copy(isRefreshing = false, actionError = result.error) else it.copy(isLoading = false, isRefreshing = false, error = result.error)
                }
            }
        }
    }
}
