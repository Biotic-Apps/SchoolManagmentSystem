package com.schoolapp.feature.staff.edit

import androidx.compose.runtime.Immutable
import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.staff.StaffAdminRepository
import com.schoolapp.core.data.staff.StaffRepository
import com.schoolapp.feature.staff.common.StaffEvents
import com.schoolapp.feature.staff.common.StaffPermissions
import com.schoolapp.feature.staff.form.FieldProblem
import com.schoolapp.feature.staff.form.StaffField
import com.schoolapp.feature.staff.form.StaffForm
import com.schoolapp.feature.staff.form.StaffFormValidation
import com.schoolapp.feature.staff.form.StaffServerErrors
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@Immutable
data class EditStaffUiState(
    val isLoading: Boolean = true,
    val canEdit: Boolean = false,
    val loadError: AppError? = null,
    val name: String = "",
    /** Masked CNIC on file; the field starts blank and blank keeps it. */
    val cnicOnFile: String? = null,
    val form: StaffForm = StaffForm(),
    val errors: Map<StaffField, FieldProblem> = emptyMap(),
    val error: AppError? = null,
    val isSaving: Boolean = false,
    val saved: Boolean = false,
)

/** Edit basic info (`PATCH /staff/:id`, `staff.edit`), like the web "Edit details" dialog. */
@HiltViewModel
class EditStaffViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val staffRepository: StaffRepository,
    private val adminRepository: StaffAdminRepository,
    private val authRepository: AuthRepository,
    private val events: StaffEvents,
) : ViewModel() {

    private val staffId: String = checkNotNull(savedStateHandle["id"]) { "Staff id missing" }

    private val _uiState = MutableStateFlow(EditStaffUiState())
    val uiState: StateFlow<EditStaffUiState> = _uiState.asStateFlow()

    init {
        load()
    }

    fun load() {
        _uiState.update { it.copy(isLoading = true, loadError = null) }
        viewModelScope.launch {
            val canEdit = StaffPermissions.canEdit(authRepository.session.filterNotNull().first())
            if (!canEdit) return@launch _uiState.update { it.copy(isLoading = false, canEdit = false) }
            when (val result = staffRepository.staffMember(staffId)) {
                is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, canEdit = true, loadError = result.error) }
                is AppResult.Success -> _uiState.update {
                    it.copy(
                        isLoading = false,
                        canEdit = true,
                        name = result.data.summary.name,
                        cnicOnFile = result.data.cnic,
                        form = StaffForm.from(result.data),
                    )
                }
            }
        }
    }

    fun onFormChange(form: StaffForm) = _uiState.update { it.copy(form = form, errors = emptyMap(), error = null) }

    fun save() {
        val state = _uiState.value
        if (state.isSaving || state.isLoading || !state.canEdit) return
        val errors = StaffFormValidation.validate(state.form, requireContact = false)
        if (errors.isNotEmpty()) return _uiState.update { it.copy(errors = errors) }
        _uiState.update { it.copy(isSaving = true, error = null) }
        viewModelScope.launch {
            when (val result = adminRepository.update(staffId, state.form.toProfileInput())) {
                is AppResult.Failure -> _uiState.update {
                    it.copy(isSaving = false, error = result.error, errors = StaffServerErrors.fieldsFor(result.error))
                }
                is AppResult.Success -> {
                    events.changed()
                    _uiState.update { it.copy(isSaving = false, saved = true) }
                }
            }
        }
    }
}
