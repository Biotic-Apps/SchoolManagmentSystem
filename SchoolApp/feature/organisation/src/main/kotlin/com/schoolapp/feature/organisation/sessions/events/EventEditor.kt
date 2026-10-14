package com.schoolapp.feature.organisation.sessions.events

import androidx.annotation.StringRes
import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.common.ActionError
import com.schoolapp.core.data.common.toActionError
import com.schoolapp.core.data.organisation.OrganisationEditRepository
import com.schoolapp.core.model.organisation.CalendarEvent
import com.schoolapp.core.model.organisation.CalendarEventInput
import com.schoolapp.feature.organisation.R
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

enum class EventField { TITLE, START, END }

/** Holiday / vacation / deadline / event form; the school-or-branch scope is fixed once created. */
@Immutable
data class EventForm(
    val id: String? = null,
    val type: String = "EVENT",
    val title: String = "",
    val startDate: String = "",
    val endDate: String = "",
    val description: String = "",
    val wholeSchool: Boolean = false,
    val errors: Map<EventField, Int> = emptyMap(),
    val saving: Boolean = false,
    val error: ActionError? = null,
) {
    val isNew: Boolean get() = id == null

    companion object {
        val TYPES = listOf("HOLIDAY", "VACATION", "DEADLINE", "EVENT")
    }
}

@Immutable
data class EventEditorState(
    val form: EventForm? = null,
    val deleteTarget: CalendarEvent? = null,
    val deleteError: ActionError? = null,
    @StringRes val notice: Int? = null,
)

class EventEditor @Inject constructor(private val repository: OrganisationEditRepository) {
    private val _state = MutableStateFlow(EventEditorState())
    val state: StateFlow<EventEditorState> = _state.asStateFlow()

    private lateinit var scope: CoroutineScope
    private var context: () -> Pair<String?, String?> = { null to null }
    private var onSaved: () -> Unit = {}

    /** [context] returns the selected (schoolId, branchId). */
    fun attach(scope: CoroutineScope, context: () -> Pair<String?, String?>, onSaved: () -> Unit) {
        this.scope = scope
        this.context = context
        this.onSaved = onSaved
    }

    fun dismissNotice() = _state.update { it.copy(notice = null) }

    fun openNew(defaultDate: String?) = _state.update {
        it.copy(form = EventForm(startDate = defaultDate.orEmpty(), endDate = defaultDate.orEmpty()))
    }

    fun openEdit(event: CalendarEvent) = _state.update {
        it.copy(
            form = EventForm(
                id = event.id,
                type = event.type ?: "EVENT",
                title = event.title,
                startDate = event.startDate.orEmpty(),
                endDate = event.endDate.orEmpty(),
                description = event.description.orEmpty(),
                wholeSchool = event.branchId == null,
            ),
        )
    }

    fun dismissForm() = _state.update { it.copy(form = null) }

    fun editForm(field: EventField?, change: (EventForm) -> EventForm) = _state.update { state ->
        state.copy(form = state.form?.let { form -> change(form).copy(errors = form.errors - setOfNotNull(field), error = null) })
    }

    fun saveForm() {
        val form = _state.value.form ?: return
        val (schoolId, branchId) = context()
        val errors = validate(form)
        if (errors.isNotEmpty()) return _state.update { it.copy(form = form.copy(errors = errors)) }
        val input = CalendarEventInput(
            schoolId = schoolId.orEmpty(),
            branchId = if (form.wholeSchool) null else branchId,
            type = form.type,
            title = form.title,
            startDate = form.startDate,
            endDate = form.endDate,
            description = form.description,
        )
        _state.update { it.copy(form = form.copy(saving = true, error = null)) }
        scope.launch {
            when (val result = repository.saveEvent(form.id, input)) {
                is AppResult.Failure -> _state.update { it.copy(form = it.form?.copy(saving = false, error = result.error.toActionError())) }
                is AppResult.Success -> {
                    _state.update { it.copy(form = null, notice = if (form.isNew) R.string.org_event_added else R.string.org_event_updated) }
                    onSaved()
                }
            }
        }
    }

    /** Asked from the edit form; the form closes so the confirmation stands alone. */
    fun askDelete(event: CalendarEvent) = _state.update { it.copy(form = null, deleteTarget = event, deleteError = null) }

    fun dismissDelete() = _state.update { it.copy(deleteTarget = null, deleteError = null) }

    fun confirmDelete() {
        val event = _state.value.deleteTarget ?: return
        scope.launch {
            when (val result = repository.deleteEvent(event.id)) {
                is AppResult.Failure -> _state.update { it.copy(deleteError = result.error.toActionError()) }
                is AppResult.Success -> {
                    _state.update { it.copy(deleteTarget = null, notice = R.string.org_event_deleted) }
                    onSaved()
                }
            }
        }
    }

    private fun validate(form: EventForm): Map<EventField, Int> = buildMap {
        if (form.title.trim().length !in 2..120) put(EventField.TITLE, R.string.org_event_title_invalid)
        if (form.startDate.isEmpty()) put(EventField.START, R.string.org_pick_start_date)
        if (form.endDate.isEmpty()) put(EventField.END, R.string.org_pick_end_date)
        if (form.startDate.isNotEmpty() && form.endDate.isNotEmpty() && form.endDate < form.startDate) {
            put(EventField.END, R.string.org_end_before_start)
        }
    }
}
