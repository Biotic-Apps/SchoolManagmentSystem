package com.schoolapp.feature.admin.schools.edit

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.files.FilesRepository
import com.schoolapp.core.data.schools.SchoolsRepository
import com.schoolapp.core.model.files.FilePurpose
import com.schoolapp.core.model.schools.LogoChange
import com.schoolapp.core.model.schools.School
import com.schoolapp.core.model.schools.SchoolUpdate
import com.schoolapp.feature.admin.common.AdminNotice
import com.schoolapp.feature.admin.common.AdminNotices
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Edit a school's name, contact details and logo (the code is fixed). */
@HiltViewModel
class SchoolEditViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val repository: SchoolsRepository,
    private val files: FilesRepository,
    private val authRepository: AuthRepository,
    private val notices: AdminNotices,
) : ViewModel() {

    private val schoolId: String = checkNotNull(savedStateHandle["schoolId"])
    private val _uiState = MutableStateFlow(SchoolEditUiState())
    val uiState: StateFlow<SchoolEditUiState> = _uiState.asStateFlow()
    private var uploadJob: Job? = null

    init {
        load()
    }

    fun load() {
        _uiState.update { it.copy(isLoading = true, loadError = null) }
        viewModelScope.launch {
            val canEdit = authRepository.session.first()?.has("schools.edit") == true
            when (val result = repository.school(schoolId)) {
                is AppResult.Success -> _uiState.update { it.copy(isLoading = false, canEdit = canEdit).filledFrom(result.data) }
                is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, canEdit = canEdit, loadError = result.error) }
            }
        }
    }

    fun onFormChange(form: SchoolForm) = _uiState.update { state ->
        val errors = if (state.errors.isEmpty()) state.errors else SchoolFormValidation.validate(form)
        state.copy(form = form, errors = errors, serverErrors = emptyMap(), isDirty = true, saveError = null)
    }

    fun onLogoPicked(uri: String) {
        uploadJob?.cancel()
        _uiState.update { it.copy(logo = it.logo.copy(isUploading = true, uploadError = null), isDirty = true) }
        uploadJob = viewModelScope.launch {
            when (val result = files.upload(uri, FilePurpose.SCHOOL_LOGO)) {
                is AppResult.Success -> _uiState.update {
                    it.copy(logo = it.logo.copy(isUploading = false, uploadedFileId = result.data.id, previewUri = uri, removed = false))
                }
                is AppResult.Failure -> _uiState.update { it.copy(logo = it.logo.copy(isUploading = false, uploadError = result.error)) }
            }
        }
    }

    fun onRemoveLogo() {
        uploadJob?.cancel()
        _uiState.update {
            it.copy(logo = it.logo.copy(uploadedFileId = null, previewUri = null, removed = true, isUploading = false), isDirty = true)
        }
    }

    fun save() {
        val state = _uiState.value
        if (state.isSaving || state.logo.isUploading) return
        val errors = SchoolFormValidation.validate(state.form)
        if (errors.isNotEmpty()) {
            _uiState.update { it.copy(errors = errors) }
            return
        }
        _uiState.update { it.copy(isSaving = true, saveError = null, errors = emptyMap(), serverErrors = emptyMap()) }
        viewModelScope.launch {
            val form = state.form
            val update = SchoolUpdate(form.name, form.address, form.phone, form.email, form.website, logoChange(state.logo))
            when (val result = repository.update(schoolId, update)) {
                is AppResult.Success -> {
                    notices.post(AdminNotice(AdminNotice.Kind.SCHOOL_UPDATED, result.data.name))
                    _uiState.update { it.copy(isSaving = false, saved = true) }
                }
                is AppResult.Failure -> _uiState.update {
                    val fields = SchoolFormValidation.serverFields(result.error)
                    it.copy(isSaving = false, serverErrors = fields, saveError = result.error.takeIf { fields.isEmpty() })
                }
            }
        }
    }

    private fun logoChange(logo: LogoState): LogoChange = when {
        logo.uploadedFileId != null -> LogoChange.Replace(logo.uploadedFileId)
        logo.removed && logo.currentUrl != null -> LogoChange.Remove
        else -> LogoChange.Keep
    }

    private fun SchoolEditUiState.filledFrom(school: School) = copy(
        code = school.code,
        form = SchoolForm(
            name = school.name,
            phone = school.phone.orEmpty(),
            email = school.email.orEmpty(),
            website = school.website.orEmpty(),
            address = school.address.orEmpty(),
        ),
        logo = LogoState(currentUrl = school.logoUrl),
    )
}
