package com.schoolapp.feature.students.detail.health

import androidx.compose.runtime.Immutable
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.health.HealthRepository
import com.schoolapp.core.data.students.detail.StudentDetailExtrasRepository
import com.schoolapp.core.model.health.HealthProfile
import com.schoolapp.core.model.health.Incident
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.async
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.receiveAsFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@Immutable
internal data class StudentHealthUiState(
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val profile: HealthProfile? = null,
    val incidents: List<Incident> = emptyList(),
    val error: AppError? = null,
    /** Non-null while the editor sheet is open. */
    val draft: HealthDraft? = null,
) {
    /** The API answers with an empty profile until one is recorded. */
    val hasProfile: Boolean
        get() = profile != null && (
            profile.updatedAt != null || profile.bloodGroup != null || profile.allergies.isNotEmpty() ||
                profile.conditions.isNotEmpty() || profile.medications.isNotEmpty() || profile.doctor != null ||
                !profile.instructions.isNullOrBlank() || profile.emergencyContacts.isNotEmpty()
            )
}

/** Health tab: profile, recent incidents and (with `health.edit`) the full profile editor. */
@HiltViewModel
internal class StudentHealthViewModel @Inject constructor(
    private val health: HealthRepository,
    private val extras: StudentDetailExtrasRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(StudentHealthUiState())
    val uiState: StateFlow<StudentHealthUiState> = _uiState.asStateFlow()

    private val _saved = Channel<Unit>(Channel.BUFFERED)
    val saved: Flow<Unit> = _saved.receiveAsFlow()

    private var studentId: String? = null

    fun start(id: String) {
        if (studentId == id) return
        studentId = id
        load()
    }

    fun load(refresh: Boolean = false) {
        val id = studentId ?: return
        _uiState.update { it.copy(isLoading = !refresh && it.profile == null, isRefreshing = refresh, error = null) }
        viewModelScope.launch {
            val incidents = async { health.incidents(studentId = id) }
            val profile = health.profile(id)
            val incidentList = (incidents.await() as? AppResult.Success)?.data.orEmpty().sortedByDescending { it.occurredAt }
            _uiState.update { state ->
                when (profile) {
                    is AppResult.Success -> state.copy(isLoading = false, isRefreshing = false, profile = profile.data, incidents = incidentList)
                    is AppResult.Failure -> state.copy(isLoading = false, isRefreshing = false, error = profile.error)
                }
            }
        }
    }

    fun openEditor() = _uiState.update { it.copy(draft = HealthDraft.from(it.profile)) }

    fun closeEditor() {
        if (_uiState.value.draft?.saving == true) return
        _uiState.update { it.copy(draft = null) }
    }

    fun onDraftChange(draft: HealthDraft) = _uiState.update { s -> s.draft?.let { s.copy(draft = draft.copy(error = null)) } ?: s }

    fun save() {
        val id = studentId ?: return
        val draft = _uiState.value.draft ?: return
        if (draft.saving) return
        if (draft.problems.isNotEmpty()) return _uiState.update { it.copy(draft = draft.copy(showErrors = true)) }
        _uiState.update { it.copy(draft = draft.copy(saving = true, error = null)) }
        viewModelScope.launch {
            when (val result = extras.replaceHealth(id, draft.toProfile())) {
                is AppResult.Success -> {
                    _uiState.update { it.copy(draft = null, profile = result.data) }
                    _saved.send(Unit)
                }
                is AppResult.Failure -> _uiState.update { s -> s.copy(draft = s.draft?.copy(saving = false, error = result.error)) }
            }
        }
    }
}
