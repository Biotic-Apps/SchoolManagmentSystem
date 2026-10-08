package com.schoolapp.feature.staff.assign

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.organisation.ClassesOverviewRepository
import com.schoolapp.core.data.staff.AllocationRepository
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.model.staff.AllocationTeacher
import com.schoolapp.core.model.staff.ClassAllocation
import com.schoolapp.feature.staff.common.StaffEvents
import com.schoolapp.feature.staff.common.StaffPermissions
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/**
 * Optional step after adding a teacher: class teacher of section(s) and subject × section allocations,
 * saved through the same endpoints as the web Class setup screen (replace semantics per cell).
 */
@HiltViewModel
class AssignClassesViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val allocationRepository: AllocationRepository,
    private val classesRepository: ClassesOverviewRepository,
    private val authRepository: AuthRepository,
    private val events: StaffEvents,
) : ViewModel() {

    private val staffId: String = checkNotNull(savedStateHandle["staffId"]) { "Staff id missing" }
    private val branchId: String = checkNotNull(savedStateHandle["branchId"]) { "Branch id missing" }

    private val _uiState = MutableStateFlow(AssignClassesUiState(staffId = staffId, staffName = savedStateHandle["staffName"] ?: ""))
    val uiState: StateFlow<AssignClassesUiState> = _uiState.asStateFlow()

    init {
        load()
    }

    fun load() {
        _uiState.update { it.copy(isLoading = true, loadError = null) }
        viewModelScope.launch {
            val session = authRepository.session.filterNotNull().first()
            if (!StaffPermissions.canAllocate(session)) return@launch _uiState.update { it.copy(isLoading = false, canAllocate = false) }
            val schoolId = session.activeAssignments.firstNotNullOfOrNull { it.schoolId }
            when (val result = classesRepository.overview(branchId, schoolId, null)) {
                is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, loadError = result.error) }
                is AppResult.Success -> {
                    val classes = result.data.filter { it.sections.isNotEmpty() }.map { c ->
                        SwitcherOption(c.id, c.name)
                    }
                    _uiState.update { it.copy(isLoading = false, classes = classes) }
                    classes.firstOrNull()?.let { selectClass(it.id) }
                }
            }
        }
    }

    fun selectClass(classId: String) {
        _uiState.update { it.copy(selectedClassId = classId, classError = null) }
        if (_uiState.value.allocations.containsKey(classId)) return
        _uiState.update { it.copy(classLoading = true) }
        viewModelScope.launch {
            val result = allocationRepository.classAllocation(classId, branchId)
            _uiState.update { state ->
                when (result) {
                    is AppResult.Failure -> state.copy(classLoading = false, classError = result.error.takeIf { state.selectedClassId == classId })
                    is AppResult.Success -> state.copy(classLoading = false, allocations = state.allocations + (classId to result.data))
                }
            }
        }
    }

    fun toggleClassTeacher(sectionId: String) = _uiState.update {
        it.copy(classTeacherOf = it.classTeacherOf.toggle(sectionId), saveError = null)
    }

    fun toggleSubject(sectionId: String, subjectId: String) = _uiState.update {
        it.copy(subjectPicks = it.subjectPicks.toggle(SubjectPick(sectionId, subjectId)), saveError = null)
    }

    fun save() {
        val state = _uiState.value
        if (state.isSaving || state.pickCount == 0) return
        _uiState.update { it.copy(isSaving = true, saveError = null, failedCount = 0) }
        viewModelScope.launch {
            var firstError: AppError? = null
            val failedSections = mutableSetOf<String>()
            val failedSubjects = mutableSetOf<SubjectPick>()
            for (sectionId in state.classTeacherOf) {
                val result = allocationRepository.setClassTeacher(sectionId, staffId)
                if (result is AppResult.Failure) {
                    firstError = firstError ?: result.error
                    failedSections += sectionId
                }
            }
            for (pick in state.subjectPicks) {
                val result = allocationRepository.setSubjectTeacher(pick.sectionId, pick.subjectId, staffId)
                if (result is AppResult.Failure) {
                    firstError = firstError ?: result.error
                    failedSubjects += pick
                }
            }
            val savedAny = failedSections.size + failedSubjects.size < state.pickCount
            if (savedAny) events.changed()
            _uiState.update {
                it.copy(
                    isSaving = false,
                    allocations = it.allocations.mapValues { (_, a) ->
                        a.withTeacher(state.classTeacherOf - failedSections, state.subjectPicks - failedSubjects, it.staffName)
                    },
                    classTeacherOf = failedSections,
                    subjectPicks = failedSubjects,
                    failedCount = failedSections.size + failedSubjects.size,
                    saveError = firstError,
                    done = firstError == null,
                )
            }
        }
    }

    /** Reflects saved picks locally so the grid shows the new teacher without a reload. */
    private fun ClassAllocation.withTeacher(sections: Set<String>, picks: Set<SubjectPick>, name: String): ClassAllocation {
        val me = AllocationTeacher(staffId, name)
        return copy(
            sections = this.sections.map { if (it.id in sections) it.copy(classTeacher = me) else it },
            subjectTeachers = subjectTeachers + picks.filter { p -> this.sections.any { it.id == p.sectionId } }
                .associate { (it.sectionId to it.subjectId) to me },
        )
    }

    private fun <T> Set<T>.toggle(value: T): Set<T> = if (value in this) this - value else this + value
}
