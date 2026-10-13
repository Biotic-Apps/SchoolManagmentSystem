package com.schoolapp.feature.pickup.parent

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.files.FilesRepository
import com.schoolapp.core.data.pickup.PickupRepository
import com.schoolapp.core.model.files.FilePurpose
import com.schoolapp.core.model.pickup.EarlyLeave
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Parent: authorized pickup persons and early-leave requests of the active child (reloads on switch). */
@HiltViewModel
class ParentPickupViewModel @Inject constructor(
    private val pickupRepository: PickupRepository,
    private val filesRepository: FilesRepository,
    private val authRepository: AuthRepository,
    private val clock: AppClock,
) : ViewModel() {

    private val _uiState = MutableStateFlow(ParentPickupUiState())
    val uiState: StateFlow<ParentPickupUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            authRepository.session.filterNotNull()
                .map { it.activeChild?.id }
                .distinctUntilChanged()
                .collectLatest(::load)
        }
    }

    fun retry() {
        viewModelScope.launch { load(_uiState.value.childId) }
    }

    private suspend fun load(childId: String?) {
        val today = clock.now().toLocalDate().toString()
        if (childId == null) {
            _uiState.value = ParentPickupUiState(isLoading = false, noChild = true, today = today)
            return
        }
        _uiState.value = ParentPickupUiState(isLoading = true, childId = childId, today = today)
        val (persons, leaves) = coroutineScope {
            val persons = async { pickupRepository.pickupPersons(childId) }
            val leaves = async { pickupRepository.earlyLeaves(studentId = childId) }
            persons.await() to leaves.await()
        }
        _uiState.update { state ->
            when {
                persons is AppResult.Failure -> state.copy(isLoading = false, error = persons.error)
                leaves is AppResult.Failure -> state.copy(isLoading = false, error = leaves.error)
                else -> state.copy(
                    isLoading = false,
                    persons = (persons as AppResult.Success).data,
                    earlyLeaves = (leaves as AppResult.Success).data.upcomingFor(childId, today),
                )
            }
        }
    }

    private fun List<EarlyLeave>.upcomingFor(childId: String, today: String) =
        filter { it.studentId == childId && it.date >= today }.sortedWith(compareBy(EarlyLeave::date, EarlyLeave::time))

    // Add pickup person

    fun openAddPerson() = _uiState.update { it.copy(personEditor = AddPersonEditor(), message = null) }

    fun dismissAddPerson() {
        if (_uiState.value.personEditor?.isSaving == true) return
        _uiState.update { it.copy(personEditor = null) }
    }

    fun onPersonChange(transform: (AddPersonEditor) -> AddPersonEditor) = editPerson { transform(it).copy(errors = emptySet()) }

    fun onPhotoPicked(uri: String) {
        editPerson { it.copy(photoUploading = true, error = null) }
        viewModelScope.launch {
            when (val result = filesRepository.upload(uri, FilePurpose.ATTACHMENT)) {
                is AppResult.Success -> editPerson { it.copy(photoUploading = false, photoFileId = result.data.id, photoUrl = result.data.url ?: uri) }
                is AppResult.Failure -> editPerson { it.copy(photoUploading = false, error = result.error) }
            }
        }
    }

    fun submitPerson() {
        val editor = _uiState.value.personEditor ?: return
        val childId = _uiState.value.childId ?: return
        if (editor.isSaving || editor.photoUploading) return
        val errors = editor.validate()
        if (errors.isNotEmpty()) {
            editPerson { it.copy(errors = errors) }
            return
        }
        editPerson { it.copy(isSaving = true, error = null) }
        viewModelScope.launch {
            when (val result = pickupRepository.addPickupPerson(childId, editor.toInput())) {
                is AppResult.Success -> _uiState.update {
                    it.copy(personEditor = null, persons = it.persons + result.data, message = ParentPickupMessage.PERSON_ADDED)
                }
                is AppResult.Failure -> editPerson { it.copy(isSaving = false, error = result.error) }
            }
        }
    }

    // Early leave

    fun openEarlyLeave() = _uiState.update { it.copy(leaveEditor = EarlyLeaveEditor(date = it.today), message = null) }

    fun dismissEarlyLeave() {
        if (_uiState.value.leaveEditor?.isSaving == true) return
        _uiState.update { it.copy(leaveEditor = null) }
    }

    fun onLeaveChange(transform: (EarlyLeaveEditor) -> EarlyLeaveEditor) = editLeave { transform(it).copy(errors = emptySet()) }

    fun submitEarlyLeave() {
        val state = _uiState.value
        val editor = state.leaveEditor ?: return
        val childId = state.childId ?: return
        if (editor.isSaving) return
        val errors = editor.validate(state.today)
        if (errors.isNotEmpty()) {
            editLeave { it.copy(errors = errors) }
            return
        }
        editLeave { it.copy(isSaving = true, error = null) }
        viewModelScope.launch {
            when (val result = pickupRepository.requestEarlyLeave(editor.toInput(childId))) {
                is AppResult.Success -> _uiState.update {
                    it.copy(
                        leaveEditor = null,
                        earlyLeaves = (it.earlyLeaves + result.data).upcomingFor(childId, it.today),
                        message = ParentPickupMessage.LEAVE_REQUESTED,
                    )
                }
                is AppResult.Failure -> editLeave { it.copy(isSaving = false, error = result.error) }
            }
        }
    }

    private fun editPerson(transform: (AddPersonEditor) -> AddPersonEditor) =
        _uiState.update { state -> state.copy(personEditor = state.personEditor?.let(transform)) }

    private fun editLeave(transform: (EarlyLeaveEditor) -> EarlyLeaveEditor) =
        _uiState.update { state -> state.copy(leaveEditor = state.leaveEditor?.let(transform)) }
}
