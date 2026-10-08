package com.schoolapp.feature.admissions.create

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.common.toActionError
import com.schoolapp.core.data.organisation.OrganisationRepository
import com.schoolapp.core.data.people.StudentAdminRepository
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
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Creates an application with `POST /admissions/applications` (same payload as the web form). */
@HiltViewModel
class NewApplicationViewModel @Inject constructor(
    private val repository: StudentAdminRepository,
    private val organisation: OrganisationRepository,
    private val authRepository: AuthRepository,
    private val clock: AppClock,
) : ViewModel() {

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
            if (!session.has(ADMISSIONS_ADD)) return@launch _uiState.update { it.copy(isLoading = false, canAdd = false) }
            val branch = session.activeBranchId?.let { id -> id to session.activeAssignments.firstNotNullOfOrNull { it.schoolId } }
                ?: (organisation.branches() as? AppResult.Success)?.data?.firstOrNull()?.let { it.id to it.schoolId }
            branchId = branch?.first
            val active = branch?.let { (organisation.sessions(it.first) as? AppResult.Success)?.data?.firstOrNull { s -> s.isActive } }
            sessionId = active?.id
            when (val classes = organisation.classes(branch?.second)) {
                is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, canAdd = true, loadError = classes.error) }
                is AppResult.Success -> _uiState.update {
                    it.copy(isLoading = false, canAdd = true, noSession = active == null, classes = classes.data.map { c -> ClassChoice(c.id, c.name) })
                }
            }
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
        val branch = branchId
        val session = sessionId
        if (branch == null || session == null) return _uiState.update { it.copy(noSession = true) }
        _uiState.update { it.copy(submitting = true, submitError = null, errors = FormErrors()) }
        viewModelScope.launch {
            val input = ApplicationInput(branch, session, s.classId!!, s.child.toInput(), s.guardians.toEntries(), s.notes.ifBlank { null })
            when (val result = repository.createApplication(input)) {
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
        const val ADMISSIONS_ADD = "admissions.add"
        const val CLASS = "classId"
        const val NOTES_MAX = 2000
    }
}
