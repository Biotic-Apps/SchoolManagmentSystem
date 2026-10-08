package com.schoolapp.feature.students.detail

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.organisation.OrganisationRepository
import com.schoolapp.core.data.people.GuardiansRepository
import com.schoolapp.core.data.people.StudentAdminRepository
import com.schoolapp.core.data.people.StudentsRepository
import com.schoolapp.feature.students.add.SectionOptionsLoader
import com.schoolapp.feature.students.manage.ManageController
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Student profile plus the web's actions (edit, change section, transfer, withdraw, guardians) via [manage]. */
@HiltViewModel
class StudentDetailViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val repository: StudentsRepository,
    admin: StudentAdminRepository,
    guardians: GuardiansRepository,
    organisation: OrganisationRepository,
    sections: SectionOptionsLoader,
    private val authRepository: AuthRepository,
    clock: AppClock,
) : ViewModel() {

    private val studentId: String = checkNotNull(savedStateHandle["id"]) { "Student id missing" }

    private val _uiState = MutableStateFlow(StudentDetailUiState(today = clock.now().toLocalDate().toString()))
    val uiState: StateFlow<StudentDetailUiState> = _uiState.asStateFlow()

    val manage = ManageController(studentId, _uiState, viewModelScope, admin, guardians, organisation, sections, authRepository, ::load)

    init {
        viewModelScope.launch {
            val session = authRepository.session.filterNotNull().first()
            _uiState.update {
                it.copy(
                    canEditStudent = session.has(STUDENTS_EDIT),
                    canLinkGuardian = session.has(STUDENTS_EDIT),
                    canEditGuardians = session.has(GUARDIANS_EDIT),
                )
            }
        }
        load()
    }

    fun load() {
        _uiState.update { it.copy(isLoading = it.detail == null, error = null) }
        viewModelScope.launch {
            when (val result = repository.student(studentId)) {
                is AppResult.Success -> _uiState.update { it.copy(isLoading = false, detail = result.data, error = null) }
                is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, error = result.error) }
            }
        }
    }

    fun noticeShown() = _uiState.update { it.copy(notice = null) }

    private companion object {
        const val STUDENTS_EDIT = "students.edit"
        const val GUARDIANS_EDIT = "guardians.edit"
    }
}
