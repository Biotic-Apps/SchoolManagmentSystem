package com.schoolapp.feature.messages.newthread

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.messages.MessagesRepository
import com.schoolapp.core.data.people.StudentsRepository
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.message.NewThreadInput
import com.schoolapp.core.model.people.StudentSummary
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.FlowPreview
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.debounce
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Parent: pick a child and (optionally) a teacher or the principal; default is the class teacher. Staff: search a student in scope, guardians receive it. */
@OptIn(FlowPreview::class)
@HiltViewModel
class NewThreadViewModel @Inject constructor(
    private val messagesRepository: MessagesRepository,
    private val studentsRepository: StudentsRepository,
    authRepository: AuthRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(NewThreadUiState())
    val uiState: StateFlow<NewThreadUiState> = _uiState.asStateFlow()

    private val query = MutableStateFlow("")
    private var recipientsJob: Job? = null

    init {
        viewModelScope.launch {
            val session = authRepository.session.filterNotNull().first()
            _uiState.update {
                it.copy(
                    isParent = session.activeRole == RoleKey.PARENT,
                    children = session.children,
                    selectedChildId = session.activeChild?.id,
                )
            }
            if (session.activeRole == RoleKey.PARENT) session.activeChild?.id?.let(::loadRecipients)
        }
        viewModelScope.launch {
            query.debounce(SEARCH_DEBOUNCE_MS).distinctUntilChanged().collectLatest(::search)
        }
    }

    fun onChildSelected(id: String) {
        if (_uiState.value.selectedChildId == id) return
        // A different child has different teachers.
        _uiState.update { it.copy(selectedChildId = id, studentMissing = false, staffUserId = null) }
        loadRecipients(id)
    }

    fun onRecipientSelected(userId: String?) = _uiState.update { it.copy(staffUserId = userId, error = null) }

    private fun loadRecipients(childId: String) {
        recipientsJob?.cancel()
        _uiState.update { it.copy(recipients = emptyList(), isLoadingRecipients = true, recipientsError = null) }
        recipientsJob = viewModelScope.launch {
            when (val result = messagesRepository.recipients(childId)) {
                is AppResult.Success -> _uiState.update { it.copy(recipients = result.data, isLoadingRecipients = false) }
                is AppResult.Failure -> _uiState.update { it.copy(isLoadingRecipients = false, recipientsError = result.error) }
            }
        }
    }

    fun onQueryChange(text: String) {
        _uiState.update { it.copy(query = text) }
        query.value = text.trim()
    }

    fun onStudentSelected(student: StudentSummary) {
        _uiState.update {
            it.copy(student = student, studentMissing = false, results = emptyList(), guardians = emptyList(), isLoadingGuardians = true)
        }
        viewModelScope.launch {
            val guardians = (studentsRepository.student(student.id) as? AppResult.Success)?.data?.guardians.orEmpty()
            _uiState.update { state ->
                if (state.student?.id != student.id) state else state.copy(guardians = guardians, isLoadingGuardians = false)
            }
        }
    }

    fun onClearStudent() {
        _uiState.update { it.copy(student = null, guardians = emptyList(), isLoadingGuardians = false) }
        query.value = ""
        _uiState.update { it.copy(query = "") }
    }

    fun onSubjectChange(text: String) = _uiState.update { it.copy(subject = text, subjectMissing = false) }

    fun onBodyChange(text: String) = _uiState.update { it.copy(body = text, bodyMissing = false) }

    fun submit() {
        val state = _uiState.value
        if (state.isSubmitting) return
        val studentId = state.studentId
        val invalid = state.copy(
            studentMissing = studentId == null,
            subjectMissing = state.subject.isBlank(),
            bodyMissing = state.body.isBlank(),
        )
        if (invalid.studentMissing || invalid.subjectMissing || invalid.bodyMissing || studentId == null) {
            _uiState.value = invalid
            return
        }
        _uiState.update { it.copy(isSubmitting = true, error = null) }
        viewModelScope.launch {
            val input = NewThreadInput(
                studentId = studentId,
                staffUserId = if (state.isParent) state.staffUserId else null,
                subject = state.subject.trim(),
                body = state.body.trim(),
            )
            when (val result = messagesRepository.startThread(input)) {
                is AppResult.Success -> _uiState.update { it.copy(isSubmitting = false, createdThreadId = result.data.id) }
                is AppResult.Failure -> _uiState.update { it.copy(isSubmitting = false, error = result.error) }
            }
        }
    }

    fun onNavigated() = _uiState.update { it.copy(createdThreadId = null) }

    private suspend fun search(text: String) {
        if (_uiState.value.isParent || text.length < MIN_QUERY) {
            _uiState.update { it.copy(results = emptyList(), isSearching = false, searchError = null) }
            return
        }
        _uiState.update { it.copy(isSearching = true, searchError = null) }
        when (val result = studentsRepository.students(search = text)) {
            is AppResult.Success -> _uiState.update { it.copy(isSearching = false, results = result.data) }
            is AppResult.Failure -> _uiState.update { it.copy(isSearching = false, results = emptyList(), searchError = result.error) }
        }
    }

    private companion object {
        const val SEARCH_DEBOUNCE_MS = 300L
        const val MIN_QUERY = 2
    }
}
