package com.schoolapp.feature.timetable.substitutions

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.timetable.TimetableRepository
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.RoleRef
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Absent-teacher cover for one date; only supervisors get it (see [SubstitutionsUiState.available]). */
@HiltViewModel
class SubstitutionsViewModel @Inject internal constructor(
    private val authRepository: AuthRepository,
    private val loader: SubstitutionsLoader,
    private val repository: TimetableRepository,
    clock: AppClock,
) : ViewModel() {

    private val _uiState = MutableStateFlow(SubstitutionsUiState(date = clock.now().toLocalDate().toString()))
    val uiState: StateFlow<SubstitutionsUiState> = _uiState.asStateFlow()

    private var branchId: String? = null
    private var lookups: SubstitutionLookups? = null
    private var started = false
    private var loadJob: Job? = null

    init {
        viewModelScope.launch {
            val session = authRepository.session.filterNotNull().first()
            val available = session.activeRole in SUPERVISORS && session.has(VIEW)
            _uiState.update { it.copy(available = available, canEdit = available && session.has(EDIT)) }
        }
    }

    /** The tab was shown: the first time loads the pickers and the day's list. */
    fun onOpened() {
        if (started || !_uiState.value.available) return
        started = true
        load()
    }

    fun onDateSelected(date: String) {
        if (date == _uiState.value.date) return
        _uiState.update { it.copy(date = date, notice = null, actionError = null) }
        load()
    }

    fun retry() = load()

    fun refresh() = load(refreshing = true)

    fun openForm() {
        val state = _uiState.value
        if (!state.canEdit) return
        _uiState.update {
            it.copy(form = SubstituteForm(date = state.date), periods = SubstitutionRows.choices(lookups?.schedule, state.date), notice = null)
        }
    }

    fun dismissForm() = _uiState.update { if (it.form?.isSaving == true) it else it.copy(form = null) }

    fun onFormSection(id: String) = editForm { it.copy(sectionId = id) }

    fun onFormPeriod(index: Int) = editForm { it.copy(periodIndex = index) }

    fun onFormTeacher(id: String) = editForm { it.copy(teacherId = id) }

    fun onFormReason(text: String) = editForm { it.copy(reason = text.take(SubstituteForm.REASON_MAX)) }

    /** A new date has its own bell schedule (e.g. a short Friday); a period it lacks is cleared. */
    fun onFormDate(date: String) {
        val choices = SubstitutionRows.choices(lookups?.schedule, date)
        _uiState.update { state ->
            val form = state.form ?: return@update state
            val period = form.periodIndex?.takeIf { index -> choices.any { it.index == index } }
            state.copy(form = form.copy(date = date, periodIndex = period, error = null), periods = choices)
        }
    }

    fun submit() {
        val form = _uiState.value.form ?: return
        if (form.isSaving) return
        val input = form.toInput()
        if (input == null) {
            editForm { it.copy(showErrors = true) }
            return
        }
        editForm { it.copy(isSaving = true) }
        viewModelScope.launch {
            when (val result = repository.assignSubstitute(input)) {
                is AppResult.Failure -> editForm { it.copy(isSaving = false, error = result.error) }
                is AppResult.Success -> {
                    _uiState.update { it.copy(form = null, date = input.date, notice = SubstitutionNotice.ASSIGNED) }
                    load()
                }
            }
        }
    }

    fun onRemoveRequested(item: SubstitutionItem) {
        if (_uiState.value.canEdit) _uiState.update { it.copy(removing = item, actionError = null, notice = null) }
    }

    fun onRemoveDismissed() = _uiState.update { if (it.isRemoving) it else it.copy(removing = null) }

    fun confirmRemove() {
        val item = _uiState.value.removing ?: return
        if (_uiState.value.isRemoving) return
        _uiState.update { it.copy(isRemoving = true) }
        viewModelScope.launch {
            val result = repository.removeOverride(item.id)
            _uiState.update { state ->
                val done = state.copy(removing = null, isRemoving = false)
                when (result) {
                    is AppResult.Failure -> done.copy(actionError = result.error)
                    is AppResult.Success -> done.copy(items = state.items.filterNot { it.id == item.id }, notice = SubstitutionNotice.REMOVED)
                }
            }
        }
    }

    private fun load(refreshing: Boolean = false) {
        loadJob?.cancel()
        loadJob = viewModelScope.launch {
            _uiState.update { it.copy(isLoading = !refreshing, isRefreshing = refreshing, error = null) }
            val branch = branchId ?: when (val result = loader.branchId(authRepository.session.filterNotNull().first())) {
                is AppResult.Failure -> return@launch fail(result.error)
                is AppResult.Success -> result.data
            }
            if (branch == null) {
                _uiState.update { it.copy(isLoading = false, isRefreshing = false, items = emptyList()) }
                return@launch
            }
            branchId = branch
            val date = _uiState.value.date
            coroutineScope {
                val fresh = if (lookups == null || refreshing) async { loader.lookups(branch) } else null
                val day = loader.day(branch, date)
                fresh?.let { lookups = it.await() }
                val known = lookups ?: SubstitutionLookups()
                when (day) {
                    is AppResult.Failure -> fail(day.error)
                    is AppResult.Success -> _uiState.update {
                        it.copy(
                            isLoading = false,
                            isRefreshing = false,
                            items = SubstitutionRows.items(day.data, known),
                            sections = known.sections,
                            teachers = known.teachers,
                        )
                    }
                }
            }
        }
    }

    private fun fail(error: AppError) = _uiState.update { it.copy(isLoading = false, isRefreshing = false, error = error) }

    private fun editForm(transform: (SubstituteForm) -> SubstituteForm) =
        _uiState.update { state -> state.form?.let { state.copy(form = transform(it.copy(error = null))) } ?: state }

    private companion object {
        const val VIEW = "timetable.view"
        const val EDIT = "timetable.edit"
        val SUPERVISORS: Set<RoleRef> = setOf(RoleKey.SUPER_ADMIN, RoleKey.PRINCIPAL, RoleKey.COORDINATOR, RoleKey.HEAD_TEACHER)
    }
}
