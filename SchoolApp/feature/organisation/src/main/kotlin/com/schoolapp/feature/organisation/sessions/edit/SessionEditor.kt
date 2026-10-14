package com.schoolapp.feature.organisation.sessions.edit

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.common.toActionError
import com.schoolapp.core.data.organisation.OrganisationEditRepository
import com.schoolapp.core.model.organisation.AcademicSession
import com.schoolapp.core.model.organisation.SessionInput
import com.schoolapp.feature.organisation.R
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** New / edit session (created as draft) and the activate / close transitions of the selected branch. */
class SessionEditor @Inject constructor(private val repository: OrganisationEditRepository) {
    private val _state = MutableStateFlow(SessionEditorState())
    val state: StateFlow<SessionEditorState> = _state.asStateFlow()

    private lateinit var scope: CoroutineScope
    private var branchId: () -> String? = { null }
    private var onSaved: () -> Unit = {}

    fun attach(scope: CoroutineScope, branchId: () -> String?, onSaved: () -> Unit) {
        this.scope = scope
        this.branchId = branchId
        this.onSaved = onSaved
    }

    fun dismissNotice() = _state.update { it.copy(notice = null) }

    fun openNew() = _state.update { it.copy(form = RangeForm()) }

    fun openEdit(session: AcademicSession) = _state.update {
        it.copy(form = RangeForm(session.id, session.name, session.startDate.orEmpty(), session.endDate.orEmpty()))
    }

    fun dismissForm() = _state.update { it.copy(form = null) }

    fun editForm(field: RangeField, change: (RangeForm) -> RangeForm) = _state.update { state ->
        state.copy(form = state.form?.let { form -> change(form).copy(errors = form.errors - field, error = null) })
    }

    fun saveForm() {
        val form = _state.value.form ?: return
        val branch = branchId() ?: return
        val errors = RangeRules.validate(form, minName = 2, maxName = 30)
        if (errors.isNotEmpty()) return _state.update { it.copy(form = form.copy(errors = errors)) }
        _state.update { it.copy(form = form.copy(saving = true, error = null)) }
        scope.launch {
            when (val result = repository.saveSession(branch, form.id, SessionInput(form.name, form.startDate, form.endDate))) {
                is AppResult.Failure -> _state.update { it.copy(form = it.form?.copy(saving = false, error = result.error.toActionError())) }
                is AppResult.Success -> {
                    _state.update { it.copy(form = null, notice = if (form.isNew) R.string.org_session_created else R.string.org_session_updated) }
                    onSaved()
                }
            }
        }
    }

    fun askTransition(session: AcademicSession, activate: Boolean) =
        _state.update { it.copy(transition = SessionTransition(session, activate)) }

    fun dismissTransition() = _state.update { it.copy(transition = null) }

    fun confirmTransition() {
        val transition = _state.value.transition?.takeUnless { it.saving } ?: return
        _state.update { it.copy(transition = transition.copy(saving = true, error = null)) }
        scope.launch {
            when (val result = repository.transitionSession(transition.session.id, transition.activate)) {
                is AppResult.Failure -> _state.update {
                    it.copy(transition = it.transition?.copy(saving = false, error = result.error.toActionError()))
                }
                is AppResult.Success -> {
                    val notice = if (transition.activate) R.string.org_session_activated else R.string.org_session_closed
                    _state.update { it.copy(transition = null, notice = notice) }
                    onSaved()
                }
            }
        }
    }
}
