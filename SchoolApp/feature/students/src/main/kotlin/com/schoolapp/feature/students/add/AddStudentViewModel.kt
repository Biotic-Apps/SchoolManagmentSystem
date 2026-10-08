package com.schoolapp.feature.students.add

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.common.toActionError
import com.schoolapp.core.data.people.StudentAdminRepository
import com.schoolapp.core.model.people.PersonProblem
import com.schoolapp.core.model.people.RegisterStudentInput
import com.schoolapp.core.ui.people.ChildForm
import com.schoolapp.core.ui.people.FormErrors
import com.schoolapp.core.ui.people.GuardianForm
import com.schoolapp.core.ui.people.MAX_GUARDIANS
import com.schoolapp.core.ui.people.problems
import com.schoolapp.core.ui.people.toEntries
import com.schoolapp.core.ui.people.withPrimary
import com.schoolapp.core.ui.people.without
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Registers a student directly into a section (`POST /students`), like the web's "Register student". */
@HiltViewModel
class AddStudentViewModel @Inject constructor(
    private val repository: StudentAdminRepository,
    private val sections: SectionOptionsLoader,
    private val authRepository: AuthRepository,
    private val clock: AppClock,
) : ViewModel() {

    private val _uiState = MutableStateFlow(AddStudentUiState())
    val uiState: StateFlow<AddStudentUiState> = _uiState.asStateFlow()

    init {
        load()
    }

    fun load() {
        val today = clock.now().toLocalDate().toString()
        _uiState.update { it.copy(isLoading = true, loadError = null, today = today, admissionDate = it.admissionDate.ifBlank { today }) }
        viewModelScope.launch {
            val session = authRepository.session.filterNotNull().first()
            if (!session.has(STUDENTS_ADD)) {
                _uiState.update { it.copy(isLoading = false, canAdd = false) }
                return@launch
            }
            when (val result = sections.load(session)) {
                is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, loadError = result.error, canAdd = true) }
                is AppResult.Success -> _uiState.update { it.copy(isLoading = false, canAdd = true, sections = result.data.sections) }
            }
        }
    }

    fun onChildChange(child: ChildForm) = _uiState.update { s -> s.copy(child = child, errors = s.errors.withoutChanged("child.", s.child, child)) }

    fun onGuardianChange(index: Int, form: GuardianForm) = _uiState.update { s ->
        s.copy(guardians = s.guardians.mapIndexed { i, row -> if (i == index) form else row }, errors = clearGuardian(s.errors, index))
    }

    fun addGuardian() = _uiState.update { s ->
        if (s.guardians.size >= MAX_GUARDIANS) s else s.copy(guardians = s.guardians + GuardianForm())
    }

    fun removeGuardian(index: Int) = _uiState.update { s ->
        if (s.guardians.size <= 1) s else s.copy(guardians = s.guardians.without(index), errors = FormErrors(s.errors.problems.filterKeys { !it.startsWith("guardians.") }))
    }

    fun makePrimary(index: Int) = _uiState.update { it.copy(guardians = it.guardians.withPrimary(index)) }

    fun onSectionChange(sectionId: String) = _uiState.update { it.copy(sectionId = sectionId, errors = it.errors.without(SECTION)) }

    fun onAdmissionDateChange(date: String) = _uiState.update { it.copy(admissionDate = date, errors = it.errors.without(ADMISSION_DATE)) }

    fun dismissError() = _uiState.update { it.copy(submitError = null) }

    fun submit() {
        val s = _uiState.value
        if (s.submitting || s.created != null) return
        val problems = buildMap<String, PersonProblem> {
            putAll(s.child.problems(s.today))
            putAll(s.guardians.problems())
            if (s.sectionId == null) put(SECTION, PersonProblem.REQUIRED)
            if (s.admissionDate.isBlank()) put(ADMISSION_DATE, PersonProblem.REQUIRED)
        }
        if (problems.isNotEmpty()) {
            _uiState.update { it.copy(errors = FormErrors(problems)) }
            return
        }
        _uiState.update { it.copy(submitting = true, submitError = null, errors = FormErrors()) }
        viewModelScope.launch {
            val input = RegisterStudentInput(s.child.toInput(), s.guardians.toEntries(), s.sectionId!!, s.admissionDate)
            when (val result = repository.register(input)) {
                is AppResult.Success -> _uiState.update { it.copy(submitting = false, created = result.data) }
                is AppResult.Failure -> _uiState.update {
                    val fields = FormErrors.fromServer(result.error)
                    // Field errors sit on their fields; anything else (section full, duplicate phones) is a banner.
                    it.copy(
                        submitting = false,
                        errors = fields,
                        submitError = result.error.toActionError().takeIf { fields.isEmpty || result.error !is AppError.Validation },
                    )
                }
            }
        }
    }

    private fun FormErrors.withoutChanged(prefix: String, before: ChildForm, after: ChildForm): FormErrors {
        val changed = listOf(
            "firstName" to (before.firstName != after.firstName), "lastName" to (before.lastName != after.lastName),
            "dob" to (before.dob != after.dob), "gender" to (before.gender != after.gender), "bForm" to (before.bForm != after.bForm),
            "previousSchool" to (before.previousSchool != after.previousSchool), "address" to (before.address != after.address),
        ).filter { it.second }.map { prefix + it.first }
        return changed.fold(this) { acc, key -> acc.without(key) }
    }

    private fun clearGuardian(errors: FormErrors, index: Int) =
        FormErrors(errors.problems.filterKeys { !it.startsWith("guardians.$index.") }, errors.server.filterKeys { !it.startsWith("guardians.$index.") })

    internal companion object {
        const val STUDENTS_ADD = "students.add"
        const val SECTION = "sectionId"
        const val ADMISSION_DATE = "admissionDate"
    }
}
