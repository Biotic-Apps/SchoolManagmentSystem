package com.schoolapp.feature.staff.assignments

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.organisation.ClassesOverviewRepository
import com.schoolapp.core.data.staff.assignments.StaffAssignmentsRepository
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.model.RoleKey
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** State and saving of the "Add assignment" sheet, owned by [AssignmentsViewModel]. */
class AddAssignmentController @Inject constructor(
    private val repository: StaffAssignmentsRepository,
    private val classes: ClassesOverviewRepository,
    private val authRepository: AuthRepository,
) {
    private lateinit var scope: CoroutineScope
    private lateinit var staffId: String
    private lateinit var state: MutableStateFlow<AssignmentsUiState>
    private lateinit var onAdded: () -> Unit
    private var branchId: String = ""

    fun attach(scope: CoroutineScope, staffId: String, state: MutableStateFlow<AssignmentsUiState>, onAdded: () -> Unit) {
        this.scope = scope
        this.staffId = staffId
        this.state = state
        this.onAdded = onAdded
    }

    fun open(branchId: String, sessionId: String?) {
        this.branchId = branchId
        state.update { it.copy(add = AddAssignmentState(sessionId = sessionId)) }
        loadClasses(sessionId)
        loadTeachers()
    }

    fun dismiss() = state.update { if (it.add?.isSaving == true) it else it.copy(add = null) }

    fun onKind(kind: String) = edit { it.copy(kind = kind, subjectId = null, missing = it.missing - AssignmentField.KIND) }

    fun onSession(id: String) {
        if (id == state.value.add?.sessionId) return
        edit { it.copy(sessionId = id, sectionId = null, subjectId = null, missing = it.missing - AssignmentField.SESSION) }
        loadClasses(id)
    }

    /** Null = whole branch (supervisor kinds only). */
    fun onSection(id: String?) = edit { it.copy(sectionId = id, subjectId = null, missing = it.missing - AssignmentField.SECTION) }

    fun onSubject(id: String) = edit { it.copy(subjectId = id, missing = it.missing - AssignmentField.SUBJECT) }

    fun onResponsible(id: String?) = edit { it.copy(responsibleStaffId = id) }

    fun onSubstitute(on: Boolean) = edit { it.copy(isSubstitute = on, missing = it.missing - AssignmentField.VALID_UNTIL) }

    fun onValidUntil(date: String) = edit { it.copy(validUntil = date, missing = it.missing - AssignmentField.VALID_UNTIL) }

    fun retryClasses() = loadClasses(state.value.add?.sessionId)

    fun submit() {
        val form = state.value.add ?: return
        if (form.isSaving) return
        val missing = form.validate()
        if (missing.isNotEmpty()) return edit { it.copy(missing = missing) }
        edit { it.copy(isSaving = true, error = null) }
        scope.launch {
            when (val result = repository.add(staffId, form.toInput(branchId))) {
                is AppResult.Failure -> edit { it.copy(isSaving = false, error = result.error) }
                is AppResult.Success -> {
                    state.update { it.copy(add = null) }
                    onAdded()
                }
            }
        }
    }

    private fun loadClasses(sessionId: String?) {
        if (sessionId == null) return
        edit { it.copy(classesLoading = true, classesError = null) }
        scope.launch {
            val schoolId = authRepository.session.first()?.activeAssignments?.firstNotNullOfOrNull { it.schoolId }
            val result = classes.overview(branchId, schoolId, sessionId)
            edit { form ->
                if (form.sessionId != sessionId) return@edit form
                when (result) {
                    is AppResult.Failure -> form.copy(classesLoading = false, classesError = result.error)
                    is AppResult.Success -> form.copy(classesLoading = false, classes = result.data.filter { it.sections.isNotEmpty() })
                }
            }
        }
    }

    private fun loadTeachers() {
        scope.launch {
            val result = repository.activeStaff(branchId) as? AppResult.Success ?: return@launch
            val teachers = result.data
                .filter { it.id != staffId && RoleKey.TEACHER.key in it.roles }
                .map { SwitcherOption(it.id, it.name) }
            edit { it.copy(teachers = teachers) }
        }
    }

    private fun edit(change: (AddAssignmentState) -> AddAssignmentState) = state.update { s ->
        s.add?.let { s.copy(add = change(it)) } ?: s
    }
}
