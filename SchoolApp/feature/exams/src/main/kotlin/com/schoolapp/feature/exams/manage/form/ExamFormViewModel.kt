package com.schoolapp.feature.exams.manage.form

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.exams.admin.ExamAdminRepository
import com.schoolapp.core.data.exams.grading.GradingSchemesRepository
import com.schoolapp.core.data.organisation.OrganisationRepository
import com.schoolapp.core.model.exams.ExamType
import com.schoolapp.core.model.exams.admin.ExamDetail
import com.schoolapp.core.model.exams.admin.ExamInput
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.async
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Create / edit an exam: name, type, session, term, grading scheme, weight and classes. */
@HiltViewModel
class ExamFormViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    private val organisation: OrganisationRepository,
    private val schemes: GradingSchemesRepository,
    private val repository: ExamAdminRepository,
) : ViewModel() {

    private val _state = MutableStateFlow(ExamFormState())
    val state: StateFlow<ExamFormState> = _state.asStateFlow()

    private var sessionJob: Job? = null

    /** Starts the form for [exam] (null = new); called each time the sheet opens. */
    fun start(exam: ExamDetail?) {
        _state.value = ExamFormState(
            examId = exam?.id,
            name = exam?.name.orEmpty(),
            type = exam?.type ?: ExamType.TERM,
            sessionId = exam?.sessionId,
            termId = exam?.termId,
            schemeId = exam?.gradingScheme?.id,
            weight = exam?.weightPercent?.toString().orEmpty(),
            classIds = exam?.classIds.orEmpty().toSet(),
        )
        loadOptions()
    }

    fun retry() = loadOptions()

    fun onName(value: String) = _state.update { it.copy(name = value, errors = it.errors.copy(name = false)) }

    fun onType(type: ExamType) = _state.update { it.copy(type = type) }

    fun onSession(id: String) {
        if (id == _state.value.sessionId) return
        _state.update { it.copy(sessionId = id, termId = null, schemeId = null, errors = it.errors.copy(session = false)) }
        loadSessionOptions(id)
    }

    fun onTerm(id: String?) = _state.update { it.copy(termId = id) }

    fun onScheme(id: String) = _state.update { it.copy(schemeId = id, errors = it.errors.copy(scheme = false)) }

    fun onWeight(value: String) = _state.update { it.copy(weight = value.filter(Char::isDigit).take(3), errors = it.errors.copy(weight = false)) }

    fun toggleClass(id: String) = _state.update {
        it.copy(classIds = if (id in it.classIds) it.classIds - id else it.classIds + id, errors = it.errors.copy(classes = false))
    }

    fun setAllClasses(selected: Boolean) = _state.update {
        it.copy(classIds = if (selected) it.classes.map { c -> c.id }.toSet() else emptySet(), errors = it.errors.copy(classes = false))
    }

    fun onSavedHandled() = _state.update { it.copy(saved = null) }

    fun save() {
        val form = _state.value
        if (form.isSaving || form.isLoading) return
        val weight = form.weight.takeIf { it.isNotBlank() }?.toIntOrNull()
        val errors = ExamFormErrors(
            name = form.name.isBlank(),
            session = form.sessionId == null,
            scheme = form.schemeId == null,
            weight = form.weight.isNotBlank() && (weight == null || weight !in 0..MAX_WEIGHT),
            classes = form.classIds.isEmpty(),
        )
        val branchId = form.branchId
        if (errors.any || branchId == null) return _state.update { it.copy(errors = errors) }
        val input = ExamInput(
            branchId = branchId,
            sessionId = requireNotNull(form.sessionId),
            termId = form.termId,
            name = form.name,
            type = form.type,
            gradingSchemeId = requireNotNull(form.schemeId),
            weightPercent = weight,
            classIds = form.classes.map { it.id }.filter { it in form.classIds } + (form.classIds - form.classes.map { it.id }.toSet()),
        )
        _state.update { it.copy(isSaving = true, saveError = null) }
        viewModelScope.launch {
            val result = form.examId?.let { repository.update(it, input) } ?: repository.create(input)
            _state.update {
                when (result) {
                    is AppResult.Success -> it.copy(isSaving = false, saved = result.data)
                    is AppResult.Failure -> it.copy(isSaving = false, saveError = result.error)
                }
            }
        }
    }

    private fun loadOptions() {
        _state.update { it.copy(isLoading = true, loadError = null) }
        viewModelScope.launch {
            val session = authRepository.session.filterNotNull().first()
            val branchId = session.activeBranchId
            if (branchId == null) return@launch _state.update { it.copy(isLoading = false) }
            val sessionsCall = async { organisation.sessions(branchId) }
            val classesCall = async { organisation.classes(null) }
            val sessions = sessionsCall.await()
            val classes = classesCall.await()
            if (sessions is AppResult.Failure) return@launch _state.update { it.copy(isLoading = false, loadError = sessions.error) }
            if (classes is AppResult.Failure) return@launch _state.update { it.copy(isLoading = false, loadError = classes.error) }
            val sessionList = (sessions as AppResult.Success).data
            val classList = (classes as AppResult.Success).data.sortedWith(compareBy({ it.levelOrder ?: Int.MAX_VALUE }, { it.name }))
            val sessionId = _state.value.sessionId ?: (sessionList.firstOrNull { it.isActive } ?: sessionList.firstOrNull())?.id
            _state.update { it.copy(isLoading = false, branchId = branchId, sessions = sessionList, classes = classList, sessionId = sessionId) }
            sessionId?.let(::loadSessionOptions)
        }
    }

    /** Terms and grading schemes of the chosen session; picks the only scheme when there is one. */
    private fun loadSessionOptions(sessionId: String) {
        sessionJob?.cancel()
        _state.update { it.copy(schemesLoading = true, terms = emptyList(), schemes = emptyList()) }
        sessionJob = viewModelScope.launch {
            val termsCall = async { repository.terms(sessionId) }
            val schemesCall = async { schemes.schemes(sessionId) }
            val terms = (termsCall.await() as? AppResult.Success)?.data.orEmpty()
            val schemeList = (schemesCall.await() as? AppResult.Success)?.data.orEmpty()
            _state.update { state ->
                if (state.sessionId != sessionId) return@update state
                val schemeId = state.schemeId?.takeIf { id -> schemeList.any { it.id == id } } ?: schemeList.singleOrNull()?.id
                val termId = state.termId?.takeIf { id -> terms.any { it.id == id } }
                state.copy(schemesLoading = false, terms = terms, schemes = schemeList, schemeId = schemeId, termId = termId)
            }
        }
    }

    private companion object {
        const val MAX_WEIGHT = 100
    }
}
