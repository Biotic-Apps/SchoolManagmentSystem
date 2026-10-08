package com.schoolapp.feature.organisation.catalogue

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.academics.AcademicsEvents
import com.schoolapp.core.data.academics.CatalogueRepository
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.common.toActionError
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.async
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Subjects (school-wide) and rooms (branch) for the "Subjects & rooms" tab: list, add, rename. */
@HiltViewModel
class CatalogueViewModel @Inject constructor(
    private val repository: CatalogueRepository,
    private val authRepository: AuthRepository,
    private val events: AcademicsEvents,
) : ViewModel() {

    private val _uiState = MutableStateFlow(CatalogueUiState())
    val uiState: StateFlow<CatalogueUiState> = _uiState.asStateFlow()

    private var branchId: String? = null
    private var schoolId: String? = null

    init {
        viewModelScope.launch {
            val session = authRepository.session.filterNotNull().first()
            _uiState.update {
                it.copy(
                    canAddSubject = session.has(CLASSES_ADD),
                    canAddRoom = session.has(CLASSES_ADD) || session.has(TIMETABLE_EDIT),
                    canRename = session.has(CLASSES_EDIT),
                )
            }
        }
    }

    /** Called by the tab with the overview's branch; reloads only when it changes. */
    fun bind(branchId: String, schoolId: String?) {
        if (branchId == this.branchId && schoolId == this.schoolId) return
        this.branchId = branchId
        this.schoolId = schoolId
        load()
    }

    fun load() {
        val branch = branchId ?: return
        _uiState.update { it.copy(isLoading = true, error = null) }
        viewModelScope.launch {
            val subjects = async { repository.subjects(schoolId) }
            val rooms = repository.rooms(branch)
            val loadedSubjects = subjects.await()
            val error = listOf(loadedSubjects, rooms).firstNotNullOfOrNull { (it as? AppResult.Failure)?.error }
            _uiState.update {
                it.copy(
                    isLoading = false,
                    error = error,
                    subjects = (loadedSubjects as? AppResult.Success)?.data ?: it.subjects,
                    rooms = (rooms as? AppResult.Success)?.data ?: it.rooms,
                )
            }
        }
    }

    fun openNew(kind: CatalogueKind) = _uiState.update { it.copy(editor = CatalogueEditor(kind)) }

    fun openEdit(kind: CatalogueKind, id: String) = _uiState.update { state ->
        val editor = when (kind) {
            CatalogueKind.SUBJECT -> state.subjects.firstOrNull { it.id == id }?.let { CatalogueEditor(kind, id, it.name) }
            CatalogueKind.ROOM -> state.rooms.firstOrNull { it.id == id }?.let { CatalogueEditor(kind, id, it.name, it.capacity?.toString().orEmpty()) }
        }
        state.copy(editor = editor.takeIf { state.canRename })
    }

    fun dismissEditor() = _uiState.update { it.copy(editor = null) }

    fun onNameChange(name: String) = edit { it.copy(name = name, nameError = null, error = null) }

    fun onCapacityChange(text: String) = edit { it.copy(capacity = text.filter(Char::isDigit).take(4), capacityError = false, error = null) }

    fun save() {
        val state = _uiState.value
        val editor = state.editor ?: return
        val existing = if (editor.kind == CatalogueKind.SUBJECT) state.subjects.map { it.id to it.name } else state.rooms.map { it.id to it.name }
        val nameError = CatalogueRules.nameProblem(editor.kind, editor.name, existing.filter { it.first != editor.id }.map { it.second })
        val capacity = editor.capacity.toIntOrNull()
        val capacityError = editor.kind == CatalogueKind.ROOM && editor.capacity.isNotEmpty() && !CatalogueRules.validCapacity(capacity)
        if (nameError != null || capacityError) {
            edit { it.copy(nameError = nameError, capacityError = capacityError) }
            return
        }
        edit { it.copy(saving = true, error = null) }
        viewModelScope.launch {
            val result = persist(editor, capacity)
            if (result is AppResult.Failure) {
                edit { it.copy(saving = false, error = result.error.toActionError()) }
            } else {
                _uiState.update { it.copy(editor = null) }
                events.changed()
                load()
            }
        }
    }

    private suspend fun persist(editor: CatalogueEditor, capacity: Int?): AppResult<*> = when (editor.kind) {
        CatalogueKind.SUBJECT -> editor.id?.let { repository.renameSubject(it, editor.name) }
            ?: repository.createSubject(schoolId.orEmpty(), editor.name)
        CatalogueKind.ROOM -> editor.id?.let { repository.updateRoom(it, editor.name, capacity) }
            ?: repository.createRoom(branchId.orEmpty(), editor.name, capacity)
    }

    private fun edit(change: (CatalogueEditor) -> CatalogueEditor) =
        _uiState.update { state -> state.copy(editor = state.editor?.let(change)) }

    private companion object {
        const val CLASSES_ADD = "classes.add"
        const val CLASSES_EDIT = "classes.edit"
        const val TIMETABLE_EDIT = "timetable.edit"
    }
}
