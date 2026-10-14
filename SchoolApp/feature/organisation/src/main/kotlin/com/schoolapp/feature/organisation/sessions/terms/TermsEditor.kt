package com.schoolapp.feature.organisation.sessions.terms

import androidx.annotation.StringRes
import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.common.ActionError
import com.schoolapp.core.data.common.toActionError
import com.schoolapp.core.data.organisation.OrganisationEditRepository
import com.schoolapp.core.model.organisation.AcademicSession
import com.schoolapp.core.model.organisation.SessionInput
import com.schoolapp.core.model.organisation.SessionTerm
import com.schoolapp.feature.organisation.R
import com.schoolapp.feature.organisation.sessions.edit.RangeField
import com.schoolapp.feature.organisation.sessions.edit.RangeForm
import com.schoolapp.feature.organisation.sessions.edit.RangeRules
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Terms sheet of one session; [editable] = `sessions.edit` and the session isn't closed. */
@Immutable
data class TermsState(
    val session: AcademicSession,
    val editable: Boolean,
    val terms: List<SessionTerm>? = null,
    val loadError: AppError? = null,
    val form: RangeForm? = null,
    val deleteTarget: SessionTerm? = null,
    val deleteError: ActionError? = null,
    @StringRes val notice: Int? = null,
)

class TermsEditor @Inject constructor(private val repository: OrganisationEditRepository) {
    private val _state = MutableStateFlow<TermsState?>(null)
    val state: StateFlow<TermsState?> = _state.asStateFlow()

    private lateinit var scope: CoroutineScope
    private var onChanged: () -> Unit = {}

    fun attach(scope: CoroutineScope, onChanged: () -> Unit) {
        this.scope = scope
        this.onChanged = onChanged
    }

    fun open(session: AcademicSession, canEdit: Boolean) {
        _state.value = TermsState(session, editable = canEdit && session.status != "CLOSED")
        load()
    }

    fun close() {
        _state.value = null
    }

    fun load() {
        val session = _state.value?.session ?: return
        update { it.copy(loadError = null) }
        scope.launch {
            when (val result = repository.terms(session.id)) {
                is AppResult.Failure -> update { it.copy(loadError = result.error) }
                is AppResult.Success -> update { it.copy(terms = result.data) }
            }
        }
    }

    fun dismissNotice() = update { it.copy(notice = null) }

    fun openForm(term: SessionTerm?) = update {
        it.copy(form = term?.let { t -> RangeForm(t.id, t.name, t.startDate, t.endDate) } ?: RangeForm(), notice = null)
    }

    fun dismissForm() = update { it.copy(form = null) }

    fun editForm(field: RangeField, change: (RangeForm) -> RangeForm) = update { state ->
        state.copy(form = state.form?.let { form -> change(form).copy(errors = form.errors - field, error = null) })
    }

    fun saveForm() {
        val state = _state.value ?: return
        val form = state.form ?: return
        val errors = RangeRules.validate(form, minName = 1, maxName = 40).ifEmpty { placementErrors(state, form) }
        if (errors.isNotEmpty()) return update { it.copy(form = form.copy(errors = errors)) }
        update { it.copy(form = form.copy(saving = true, error = null)) }
        scope.launch {
            when (val result = repository.saveTerm(state.session.id, form.id, SessionInput(form.name, form.startDate, form.endDate))) {
                is AppResult.Failure -> update { it.copy(form = it.form?.copy(saving = false, error = result.error.toActionError())) }
                is AppResult.Success -> {
                    update { it.copy(form = null, notice = if (form.isNew) R.string.org_term_added else R.string.org_term_updated) }
                    changed()
                }
            }
        }
    }

    fun askDelete(term: SessionTerm) = update { it.copy(deleteTarget = term, deleteError = null) }

    fun dismissDelete() = update { it.copy(deleteTarget = null, deleteError = null) }

    fun confirmDelete() {
        val term = _state.value?.deleteTarget ?: return
        scope.launch {
            when (val result = repository.deleteTerm(term.id)) {
                is AppResult.Failure -> update { it.copy(deleteError = result.error.toActionError()) }
                is AppResult.Success -> {
                    update { it.copy(deleteTarget = null, notice = R.string.org_term_removed) }
                    changed()
                }
            }
        }
    }

    /** Terms sit inside the session and don't overlap their siblings (same rule as the web). */
    private fun placementErrors(state: TermsState, form: RangeForm): Map<RangeField, Int> {
        val start = state.session.startDate
        val end = state.session.endDate
        if (start != null && end != null && (form.startDate < start || form.endDate > end)) {
            return mapOf(RangeField.START to R.string.org_term_outside_session)
        }
        val clash = state.terms.orEmpty().any { it.id != form.id && form.startDate <= it.endDate && it.startDate <= form.endDate }
        return if (clash) mapOf(RangeField.START to R.string.org_term_overlaps) else emptyMap()
    }

    private fun changed() {
        load()
        onChanged()
    }

    private fun update(change: (TermsState) -> TermsState) = _state.update { it?.let(change) }
}
