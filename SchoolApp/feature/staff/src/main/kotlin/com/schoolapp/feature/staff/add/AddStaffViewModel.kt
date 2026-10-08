package com.schoolapp.feature.staff.add

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.organisation.OrganisationRepository
import com.schoolapp.core.data.staff.StaffAdminRepository
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.model.staff.NewStaffInput
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

/** Add a teacher / helper (`POST /staff`), like the web "Add staff" dialog; sign-in account on by default. */
@HiltViewModel
class AddStaffViewModel @Inject constructor(
    private val repository: StaffAdminRepository,
    private val authRepository: AuthRepository,
    private val organisationRepository: OrganisationRepository,
    private val events: StaffEvents,
    clock: AppClock,
) : ViewModel() {

    private val _uiState = MutableStateFlow(AddStaffUiState(form = StaffForm(joinDate = clock.now().toLocalDate().toString())))
    val uiState: StateFlow<AddStaffUiState> = _uiState.asStateFlow()

    init {
        load()
    }

    fun load() {
        _uiState.update { it.copy(isLoading = true, loadError = null) }
        viewModelScope.launch {
            val session = authRepository.session.filterNotNull().first()
            val canAdd = StaffPermissions.canAdd(session)
            val ownBranch = session.activeBranchId
            if (!canAdd || ownBranch != null) {
                return@launch _uiState.update { it.copy(isLoading = false, canAdd = canAdd, branchId = ownBranch) }
            }
            when (val branches = organisationRepository.branches()) {
                is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, canAdd = true, loadError = branches.error) }
                is AppResult.Success -> {
                    val options = branches.data.filter { it.status != ARCHIVED }.map {
                        SwitcherOption(it.id, it.name, listOfNotNull(it.schoolName, it.code).joinToString(" · ").ifEmpty { null })
                    }
                    _uiState.update {
                        it.copy(isLoading = false, canAdd = true, branchOptions = options, branchId = options.singleOrNull()?.id)
                    }
                }
            }
        }
    }

    fun onFormChange(form: StaffForm) = _uiState.update { state ->
        state.copy(form = form, errors = state.errors.clearChanged(state.form, form), error = null)
    }

    fun onCreateAccountChange(enabled: Boolean) = _uiState.update {
        it.copy(createAccount = enabled, errors = it.errors.filterValues { p -> p != FieldProblem.CONTACT_FOR_ACCOUNT })
    }

    fun onRoleChange(role: String) = _uiState.update { it.copy(chosenRole = role) }

    fun onBranchChange(branchId: String) = _uiState.update { it.copy(branchId = branchId, errors = it.errors - StaffField.BRANCH) }

    fun submit() {
        val state = _uiState.value
        if (state.isSaving || state.created != null || !state.canAdd) return
        val errors = StaffFormValidation.validate(state.form, requireContact = state.createAccount).toMutableMap()
        if (state.branchId == null) errors[StaffField.BRANCH] = FieldProblem.REQUIRED
        if (errors.isNotEmpty()) return _uiState.update { it.copy(errors = errors, error = null) }
        val input = NewStaffInput(
            profile = state.form.toProfileInput(),
            branchId = state.branchId!!,
            createAccount = state.createAccount,
            roleKey = state.roleKey,
        )
        _uiState.update { it.copy(isSaving = true, error = null, errors = emptyMap()) }
        viewModelScope.launch {
            when (val result = repository.create(input)) {
                is AppResult.Failure -> _uiState.update {
                    it.copy(isSaving = false, error = result.error, errors = StaffServerErrors.fieldsFor(result.error))
                }
                is AppResult.Success -> {
                    events.changed()
                    _uiState.update { it.copy(isSaving = false, created = result.data) }
                }
            }
        }
    }

    /** Drops errors of fields the user just edited (contact errors clear together). */
    private fun Map<StaffField, FieldProblem>.clearChanged(old: StaffForm, new: StaffForm): Map<StaffField, FieldProblem> {
        val changed = buildSet {
            if (old.name != new.name) add(StaffField.NAME)
            if (old.email != new.email || old.phone != new.phone) addAll(listOf(StaffField.EMAIL, StaffField.PHONE))
            if (old.employeeNo != new.employeeNo) add(StaffField.EMPLOYEE_NO)
            if (old.designation != new.designation) add(StaffField.DESIGNATION)
            if (old.joinDate != new.joinDate) add(StaffField.JOIN_DATE)
            if (old.cnic != new.cnic) add(StaffField.CNIC)
            if (old.qualification != new.qualification) add(StaffField.QUALIFICATION)
        }
        return this - changed
    }

    private companion object {
        const val ARCHIVED = "ARCHIVED"
    }
}
