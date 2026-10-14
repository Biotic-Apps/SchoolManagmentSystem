package com.schoolapp.feature.students.detail.idcard

import androidx.compose.runtime.Immutable
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.idcards.StudentIdCardRepository
import com.schoolapp.core.data.organisation.OrganisationRepository
import com.schoolapp.core.model.idcards.IdCardPrintTarget
import com.schoolapp.core.model.idcards.IdCardSheets
import com.schoolapp.core.model.organisation.Section
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** One choice of the bulk print sheet: whole branch, a whole class, or one section. */
internal data class PrintOption(val id: String, val target: IdCardPrintTarget, val kind: Kind, val label: String, val count: Int?) {
    enum class Kind { BRANCH, CLASS, SECTION }
}

@Immutable
internal data class PrintIdCardsUiState(
    val isLoading: Boolean = true,
    val options: List<PrintOption> = emptyList(),
    val selectedId: String? = null,
    val loadError: AppError? = null,
    val printing: Boolean = false,
    val printError: AppError? = null,
    /** Set once the PDF is ready; the sheet opens it and closes. */
    val result: IdCardSheets? = null,
)

/** Bulk ID card sheets (`POST /students/id-cards/print`, then `GET /jobs/:id`) for the active session of a branch. */
@HiltViewModel
internal class PrintIdCardsViewModel @Inject constructor(
    private val organisation: OrganisationRepository,
    private val auth: AuthRepository,
    private val repository: StudentIdCardRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(PrintIdCardsUiState())
    val uiState: StateFlow<PrintIdCardsUiState> = _uiState.asStateFlow()

    private var printJob: Job? = null

    fun open(branchId: String?, sectionId: String?) {
        printJob?.cancel()
        _uiState.value = PrintIdCardsUiState()
        viewModelScope.launch {
            when (val loaded = loadOptions(branchId)) {
                is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, loadError = loaded.error) }
                is AppResult.Success -> _uiState.update {
                    val options = loaded.data
                    val preselect = options.firstOrNull { o -> o.kind == PrintOption.Kind.SECTION && o.id.endsWith(":$sectionId") } ?: options.firstOrNull()
                    it.copy(isLoading = false, options = options, selectedId = preselect?.id)
                }
            }
        }
    }

    fun select(id: String) = _uiState.update { it.copy(selectedId = id, printError = null) }

    fun print() {
        val state = _uiState.value
        val option = state.options.firstOrNull { it.id == state.selectedId } ?: return
        if (state.printing) return
        _uiState.update { it.copy(printing = true, printError = null) }
        printJob = viewModelScope.launch {
            when (val result = repository.printSheets(option.target)) {
                is AppResult.Success -> _uiState.update { it.copy(printing = false, result = result.data) }
                is AppResult.Failure -> _uiState.update { it.copy(printing = false, printError = result.error) }
            }
        }
    }

    fun cancel() {
        printJob?.cancel()
        _uiState.update { it.copy(printing = false) }
    }

    fun resultHandled() = _uiState.update { it.copy(result = null) }

    private suspend fun loadOptions(branchId: String?): AppResult<List<PrintOption>> {
        val session = auth.session.filterNotNull().first()
        val branch = branchId ?: session.activeBranchId ?: when (val branches = organisation.branches()) {
            is AppResult.Failure -> return branches
            is AppResult.Success -> branches.data.firstOrNull()?.id
        } ?: return AppResult.Success(emptyList())
        val active = when (val sessions = organisation.sessions(branch)) {
            is AppResult.Failure -> return sessions
            is AppResult.Success -> sessions.data.firstOrNull { it.isActive }
        }
        val sections = when (val result = organisation.sections(branch, active?.id)) {
            is AppResult.Failure -> return result
            is AppResult.Success -> result.data.filter { it.status == null || it.status == "ACTIVE" }
        }
        return AppResult.Success(buildOptions(branch, sections))
    }

    private fun buildOptions(branchId: String, sections: List<Section>): List<PrintOption> = buildList {
        add(PrintOption("all", IdCardPrintTarget.Branch(branchId), PrintOption.Kind.BRANCH, "", sections.sumOf { it.studentCount }))
        sections.groupBy { it.classId to it.className }.entries.sortedBy { it.key.second.orEmpty() }
            .forEach { (key, classSections) ->
                val (classId, className) = key
                if (classId != null && classSections.size > 1) {
                    add(PrintOption("class:$classId", IdCardPrintTarget.Branch(branchId, classId), PrintOption.Kind.CLASS, className.orEmpty(), classSections.sumOf { it.studentCount }))
                }
                classSections.sortedBy { it.name }.forEach { s ->
                    val label = listOfNotNull(s.className, s.name).joinToString(" · ")
                    add(PrintOption("section:${s.id}", IdCardPrintTarget.Section(s.id), PrintOption.Kind.SECTION, label, s.studentCount))
                }
            }
    }
}
