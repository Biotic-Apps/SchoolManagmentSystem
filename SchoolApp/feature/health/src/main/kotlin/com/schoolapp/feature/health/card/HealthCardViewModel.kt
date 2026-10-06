package com.schoolapp.feature.health.card

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.health.HealthRepository
import com.schoolapp.core.data.people.StudentsRepository
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.SessionContext
import com.schoolapp.core.model.health.Incident
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** One student's health card; a null `studentId` follows the parent's active child (reloads on switch). */
@HiltViewModel
class HealthCardViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val healthRepository: HealthRepository,
    private val studentsRepository: StudentsRepository,
    private val authRepository: AuthRepository,
) : ViewModel() {

    private val argStudentId: String? = savedStateHandle["studentId"]
    private var draftKey = 0L

    private val _uiState = MutableStateFlow(HealthCardUiState())
    val uiState: StateFlow<HealthCardUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            if (argStudentId != null) {
                load(argStudentId)
            } else {
                authRepository.session.filterNotNull()
                    .map { it.activeChild?.id }
                    .distinctUntilChanged()
                    .collectLatest(::load)
            }
        }
    }

    fun retry() {
        viewModelScope.launch { load(_uiState.value.studentId ?: argStudentId) }
    }

    private suspend fun load(studentId: String?) {
        val session = authRepository.session.first()
        val isParent = session?.activeRole == RoleKey.PARENT
        val canReport = !isParent && session?.has(VIEW_PERMISSION) == true
        if (studentId == null) {
            _uiState.value = HealthCardUiState(isLoading = false, noChild = true, isParent = isParent)
            return
        }
        _uiState.value = HealthCardUiState(isLoading = true, studentId = studentId, isParent = isParent, canReport = canReport)
        val (profile, name, incidents) = coroutineScope {
            val profile = async { healthRepository.profile(studentId) }
            val name = async { studentName(session, studentId) }
            val incidents = async { if (isParent) healthRepository.incidents(studentId = studentId) else null }
            Triple(profile.await(), name.await(), incidents.await())
        }
        val incidentList = (incidents as? AppResult.Success<List<Incident>>)?.data.orEmpty().sortedByDescending(Incident::occurredAt)
        _uiState.update { state ->
            when (profile) {
                is AppResult.Success -> state.copy(
                    isLoading = false,
                    studentName = name,
                    profile = profile.data.copy(emergencyContacts = profile.data.emergencyContacts.sortedBy { it.priority }),
                    incidents = incidentList,
                )
                is AppResult.Failure -> if (profile.error.isNotFound()) {
                    state.copy(isLoading = false, studentName = name, notFound = true, incidents = incidentList)
                } else {
                    state.copy(isLoading = false, studentName = name, error = profile.error)
                }
            }
        }
    }

    private suspend fun studentName(session: SessionContext?, studentId: String): String? =
        session?.children?.firstOrNull { it.id == studentId }?.fullName
            ?: (studentsRepository.student(studentId) as? AppResult.Success)?.data?.summary?.name

    fun openChangeRequest() {
        val profile = _uiState.value.profile
        _uiState.update {
            it.copy(
                requestSent = false,
                editor = ChangeRequestEditor(
                    instructions = profile?.instructions.orEmpty(),
                    allergies = profile?.allergies.orEmpty().map { a ->
                        AllergyDraft(nextKey(), a.name, a.severity.orEmpty(), a.reaction.orEmpty())
                    },
                    contacts = profile?.emergencyContacts.orEmpty().map { c ->
                        ContactDraft(nextKey(), c.name, c.relation.orEmpty(), c.phone)
                    },
                ),
            )
        }
    }

    fun onInstructionsChange(text: String) = editEditor { it.copy(instructions = text) }

    fun addAllergy() = editEditor { it.copy(allergies = it.allergies + AllergyDraft(nextKey())) }

    fun onAllergyChange(draft: AllergyDraft) = editEditor { e -> e.copy(allergies = e.allergies.map { if (it.key == draft.key) draft else it }) }

    fun removeAllergy(key: Long) = editEditor { e -> e.copy(allergies = e.allergies.filterNot { it.key == key }) }

    fun addContact() = editEditor { it.copy(contacts = it.contacts + ContactDraft(nextKey())) }

    fun onContactChange(draft: ContactDraft) = editEditor { e -> e.copy(contacts = e.contacts.map { if (it.key == draft.key) draft else it }) }

    fun removeContact(key: Long) = editEditor { e -> e.copy(contacts = e.contacts.filterNot { it.key == key }) }

    fun dismissChangeRequest() {
        if (_uiState.value.editor?.isSaving == true) return
        _uiState.update { it.copy(editor = null) }
    }

    fun submitChangeRequest() {
        val editor = _uiState.value.editor ?: return
        val studentId = _uiState.value.studentId ?: return
        if (editor.isSaving) return
        if (!editor.isValid) {
            editEditor { it.copy(showErrors = true) }
            return
        }
        editEditor { it.copy(isSaving = true, error = null) }
        viewModelScope.launch {
            when (val result = healthRepository.requestChange(studentId, editor.toInput())) {
                is AppResult.Success -> _uiState.update { it.copy(editor = null, requestSent = true) }
                is AppResult.Failure -> editEditor { it.copy(isSaving = false, error = result.error) }
            }
        }
    }

    private fun nextKey(): Long = ++draftKey

    private fun editEditor(transform: (ChangeRequestEditor) -> ChangeRequestEditor) =
        _uiState.update { state -> state.copy(editor = state.editor?.let(transform)) }

    private fun AppError.isNotFound(): Boolean = this is AppError.Server && httpCode == HTTP_NOT_FOUND

    private companion object {
        const val VIEW_PERMISSION = "health.view"
        const val HTTP_NOT_FOUND = 404
    }
}
