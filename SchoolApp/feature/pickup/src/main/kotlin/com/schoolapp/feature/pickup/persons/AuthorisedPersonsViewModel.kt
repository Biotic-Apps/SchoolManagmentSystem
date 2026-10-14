package com.schoolapp.feature.pickup.persons

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.people.StudentsRepository
import com.schoolapp.core.data.pickup.PickupRepository
import com.schoolapp.core.data.students.detail.StudentDetailExtrasRepository
import com.schoolapp.core.model.people.StudentSummary
import com.schoolapp.core.model.pickup.PickupPerson
import com.schoolapp.feature.pickup.components.StudentSearch
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.receiveAsFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Web AuthorizedPersonsTab: search a student, list their pickup persons, verify / revoke (`POST /pickup-persons/{id}/verify|revoke`). */
@HiltViewModel
class AuthorisedPersonsViewModel @Inject constructor(
    private val pickupRepository: PickupRepository,
    private val extras: StudentDetailExtrasRepository,
    studentsRepository: StudentsRepository,
    authRepository: AuthRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(AuthorisedPersonsUiState())
    val uiState: StateFlow<AuthorisedPersonsUiState> = _uiState.asStateFlow()

    private val _events = Channel<PersonsEvent>(Channel.BUFFERED)
    val events: Flow<PersonsEvent> = _events.receiveAsFlow()
    private var loadJob: Job? = null

    private val search = StudentSearch(viewModelScope, studentsRepository) { transform ->
        _uiState.update { it.copy(search = transform(it.search)) }
    }

    init {
        viewModelScope.launch {
            val session = authRepository.session.first()
            _uiState.update { it.copy(canManage = session?.has(EDIT_PERMISSION) == true) }
        }
    }

    fun onQueryChange(query: String) = search.onQueryChange(query)

    fun onStudentPicked(student: StudentSummary) {
        search.clear()
        _uiState.update { it.copy(student = student, persons = emptyList()) }
        load(refresh = false)
    }

    fun onClearStudent() {
        loadJob?.cancel()
        _uiState.update { it.copy(student = null, persons = emptyList(), error = null, isLoading = false, isRefreshing = false) }
    }

    fun load(refresh: Boolean = true) {
        val studentId = _uiState.value.student?.id ?: return
        loadJob?.cancel()
        _uiState.update { it.copy(isLoading = !refresh || it.persons.isEmpty(), isRefreshing = refresh && it.persons.isNotEmpty(), error = null) }
        loadJob = viewModelScope.launch {
            val result = pickupRepository.pickupPersons(studentId)
            _uiState.update { state ->
                when (result) {
                    is AppResult.Success -> state.copy(isLoading = false, isRefreshing = false, persons = result.data)
                    is AppResult.Failure -> state.copy(isLoading = false, isRefreshing = false, error = result.error)
                }
            }
        }
    }

    fun ask(person: PickupPerson, action: PersonAction) = _uiState.update { it.copy(confirm = PersonConfirm(person, action)) }

    fun dismiss() {
        if (_uiState.value.confirm?.busy == true) return
        _uiState.update { it.copy(confirm = null) }
    }

    fun confirm() {
        val confirm = _uiState.value.confirm ?: return
        if (confirm.busy) return
        _uiState.update { it.copy(confirm = confirm.copy(busy = true)) }
        viewModelScope.launch {
            val result = when (confirm.action) {
                PersonAction.VERIFY -> extras.verifyPickupPerson(confirm.person.id)
                PersonAction.REVOKE -> extras.revokePickupPerson(confirm.person.id)
            }
            when (result) {
                is AppResult.Success -> {
                    _uiState.update { s -> s.copy(confirm = null, persons = s.persons.map { if (it.id == result.data.id) result.data else it }) }
                    _events.send(PersonsEvent.Done(confirm.action))
                }
                is AppResult.Failure -> {
                    _uiState.update { it.copy(confirm = null) }
                    _events.send(PersonsEvent.Failed(result.error))
                }
            }
        }
    }

    private companion object {
        const val EDIT_PERMISSION = "pickup.edit"
    }
}
