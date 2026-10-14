package com.schoolapp.feature.settings.school

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.files.FilesRepository
import com.schoolapp.core.data.settings.SettingsRepository
import com.schoolapp.core.model.files.FilePurpose
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** School & branding form of one school (keyed per school by the caller). */
@HiltViewModel
internal class SchoolBrandingViewModel @Inject constructor(
    private val repository: SettingsRepository,
    private val files: FilesRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(SchoolBrandingUiState())
    val uiState: StateFlow<SchoolBrandingUiState> = _uiState.asStateFlow()

    private var schoolId: String? = null
    private var loadJob: Job? = null

    fun bind(id: String) {
        if (schoolId == id) return
        schoolId = id
        load(refreshing = false)
    }

    fun retry() = load(refreshing = false)

    /** Pull-to-refresh keeps unsaved edits; it only reloads when nothing was changed. */
    fun refresh() = if (_uiState.value.dirty) Unit else load(refreshing = true)

    fun edit(transform: (SchoolForm) -> SchoolForm) = _uiState.update { state ->
        val form = transform(state.form)
        state.copy(
            form = form,
            saved = false,
            saveError = null,
            nameMissing = state.nameMissing && form.displayName.isBlank(),
            serverErrors = state.serverErrors.filterKeys { key -> fieldValue(form, key) == fieldValue(state.form, key) },
        )
    }

    fun discard() = _uiState.update { it.copy(form = it.initial, nameMissing = false, serverErrors = emptyMap(), saveError = null) }

    fun uploadLogo(uri: String) {
        _uiState.update { it.copy(uploadingLogo = true, logoError = null) }
        viewModelScope.launch {
            val result = files.upload(uri, FilePurpose.SCHOOL_LOGO)
            _uiState.update { state ->
                when (result) {
                    is AppResult.Success -> state.copy(
                        uploadingLogo = false,
                        saved = false,
                        form = state.form.copy(logoFileId = result.data.id, logoUrl = result.data.url),
                    )
                    is AppResult.Failure -> state.copy(uploadingLogo = false, logoError = result.error)
                }
            }
        }
    }

    fun save() {
        val state = _uiState.value
        val id = schoolId ?: return
        if (state.saving || !state.dirty) return
        if (state.form.displayName.isBlank()) {
            _uiState.update { it.copy(nameMissing = true) }
            return
        }
        if (!state.form.colorPasses) return
        _uiState.update { it.copy(saving = true, saved = false, saveError = null, serverErrors = emptyMap()) }
        viewModelScope.launch {
            val submitted = state.form
            val result = repository.saveSchool(id, submitted.toInput())
            _uiState.update { current ->
                when (result) {
                    is AppResult.Success -> {
                        val savedForm = result.data?.let { SchoolForm.from(it) } ?: submitted
                        current.copy(
                            saving = false,
                            saved = true,
                            settings = result.data ?: current.settings,
                            initial = savedForm,
                            form = savedForm,
                        )
                    }
                    is AppResult.Failure -> current.copy(
                        saving = false,
                        saveError = result.error,
                        serverErrors = (result.error as? AppError.Validation)?.fields.orEmpty(),
                    )
                }
            }
        }
    }

    private fun load(refreshing: Boolean) {
        val id = schoolId ?: return
        loadJob?.cancel()
        loadJob = viewModelScope.launch {
            _uiState.update { it.copy(isLoading = !refreshing && it.settings == null, isRefreshing = refreshing, error = null) }
            val result = repository.school(id)
            _uiState.update { state ->
                val base = state.copy(isLoading = false, isRefreshing = false)
                when (result) {
                    is AppResult.Success -> {
                        val form = SchoolForm.from(result.data)
                        base.copy(settings = result.data, initial = form, form = form, serverErrors = emptyMap())
                    }
                    is AppResult.Failure -> base.copy(error = result.error)
                }
            }
        }
    }

    private fun fieldValue(form: SchoolForm, key: String): Any? = when (key) {
        "displayName" -> form.displayName
        "logoFileId" -> form.logoFileId
        "primaryColor" -> form.primaryColor
        "receiptFooter" -> form.receiptFooter
        "reportCardFooter" -> form.reportCardFooter
        else -> null
    }
}
