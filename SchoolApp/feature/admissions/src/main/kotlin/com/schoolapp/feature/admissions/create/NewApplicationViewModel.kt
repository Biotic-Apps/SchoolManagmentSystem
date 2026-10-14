package com.schoolapp.feature.admissions.create

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.result.map
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.admissions.AdmissionsRepository
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.common.toActionError
import com.schoolapp.core.model.admissions.ApplicationFormInput
import com.schoolapp.core.model.people.ApplicationInput
import com.schoolapp.core.model.people.PersonProblem
import com.schoolapp.core.ui.people.ChildForm
import com.schoolapp.core.ui.people.FormErrors
import com.schoolapp.core.ui.people.GuardianForm
import com.schoolapp.core.ui.people.MAX_GUARDIANS
import com.schoolapp.core.ui.people.problems
import com.schoolapp.core.ui.people.toEntries
import com.schoolapp.core.ui.people.withPrimary
import com.schoolapp.core.ui.people.without
import com.schoolapp.feature.admissions.common.AdmissionPermissions
import com.schoolapp.feature.admissions.common.AdmissionScopeLoader
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** `POST /admissions/applications` (new) or `PATCH /admissions/applications/:id` (edit, when an `id` is in the route). */
@HiltViewModel
class NewApplicationViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val repository: AdmissionsRepository,
    private val scopeLoader: AdmissionScopeLoader,
    private val authRepository: AuthRepository,
    private val clock: AppClock,
) : ViewModel() {

    private val editId: String? = savedStateHandle["id"]

    private val _uiState = MutableStateFlow(NewApplicationUiState())
    val uiState: StateFlow<NewApplicationUiState> = _uiState.asStateFlow()

    private var branchId: String? = null
    private var sessionId: String? = null

    init {
        load()
    }

    fun load() {
        _uiState.update { it.copy(isLoading = true, loadError = null, today = clock.now().toLocalDate().toString()) }
        viewModelScope.launch {
            val session = authRepository.session.filterNotNull().first()
            val needed = if (editId != null) AdmissionPermissions.EDIT else AdmissionPermissions.ADD
            if (!session.has(needed)) return@launch _uiState.update { it.copy(isLoading = false, canAdd = false) }
            if (editId != null) return@launch loadForEdit(editId)
            val scope = scopeLoader.load()
            branchId = scope.branchId
            sessionId = scope.sessionId
            _uiState.update {
                it.copy(isLoading = false, canAdd = true, loadError = scope.error, noSession = scope.sessionId == null, classes = scope.classes)
            }
        }
    }

    private suspend fun loadForEdit(id: String) {
        when (val result = repository.application(id)) {
            is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, canAdd = true, loadError = result.error) }
            is AppResult.Success -> _uiState.update { it.copy(isLoading = false, canAdd = true).filledFrom(result.data) }
        }
    }

    fun onClass(classId: String) = _uiState.update { it.copy(classId = classId, errors = it.errors.without(CLASS)) }

    fun onChildChange(child: ChildForm) = _uiState.update { it.copy(child = child, errors = it.errors.except("child.")) }

    fun onGuardianChange(index: Int, form: GuardianForm) = _uiState.update { s ->
        s.copy(guardians = s.guardians.mapIndexed { i, row -> if (i == index) form else row }, errors = s.errors.except("guardians.$index."))
    }

    fun addGuardian() = _uiState.update { if (it.guardians.size >= MAX_GUARDIANS) it else it.copy(guardians = it.guardians + GuardianForm()) }

    fun removeGuardian(index: Int) = _uiState.update {
        if (it.guardians.size <= 1) it else it.copy(guardians = it.guardians.without(index), errors = it.errors.except("guardians."))
    }

    fun makePrimary(index: Int) = _uiState.update { it.copy(guardians = it.guardians.withPrimary(index)) }

    fun onMedical(medical: MedicalForm) = _uiState.update {
        it.copy(medical = medical.copy(allergies = medical.allergies.take(MEDICAL_MAX), conditions = medical.conditions.take(MEDICAL_MAX), notes = medical.notes.take(NOTES_MAX)))
    }

    fun onNotes(notes: String) = _uiState.update { it.copy(notes = notes.take(NOTES_MAX)) }

    fun dismissError() = _uiState.update { it.copy(submitError = null) }

    fun submit() {
        val s = _uiState.value
        if (s.submitting || s.createdId != null) return
        val problems = buildMap<String, PersonProblem> {
            putAll(s.child.problems(s.today))
            putAll(s.guardians.problems())
            if (s.classId == null) put(CLASS, PersonProblem.REQUIRED)
        }
        if (problems.isNotEmpty()) return _uiState.update { it.copy(errors = FormErrors(problems)) }
        if (editId == null && (branchId == null || sessionId == null)) return _uiState.update { it.copy(noSession = true) }
        _uiState.update { it.copy(submitting = true, submitError = null, errors = FormErrors()) }
        viewModelScope.launch {
            val notes = s.notes.ifBlank { null }
            val result = if (editId != null) {
                repository.updateApplication(editId, ApplicationFormInput(s.child.toInput(), s.guardians.toEntries(), s.medical.toInfo(), notes)).map { it.id }
            } else {
                val input = ApplicationInput(branchId!!, sessionId!!, s.classId!!, s.child.toInput(), s.guardians.toEntries(), notes)
                repository.createApplication(input, s.medical.toInfo())
            }
            when (result) {
                is AppResult.Success -> _uiState.update { it.copy(submitting = false, createdId = result.data) }
                is AppResult.Failure -> _uiState.update {
                    val fields = FormErrors.fromServer(result.error)
                    it.copy(
                        submitting = false,
                        errors = fields,
                        submitError = result.error.toActionError().takeIf { fields.isEmpty || result.error !is AppError.Validation },
                    )
                }
            }
        }
    }

    private fun FormErrors.except(prefix: String) =
        FormErrors(problems.filterKeys { !it.startsWith(prefix) }, server.filterKeys { !it.startsWith(prefix) })

    internal companion object {
        const val CLASS = "classId"
        const val NOTES_MAX = 2000
        const val MEDICAL_MAX = 1000
    }
}
