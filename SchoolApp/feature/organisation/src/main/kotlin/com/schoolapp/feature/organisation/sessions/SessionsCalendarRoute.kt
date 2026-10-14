package com.schoolapp.feature.organisation.sessions

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.ConfirmDialog
import com.schoolapp.core.ui.actionErrorMessage
import com.schoolapp.feature.organisation.R
import com.schoolapp.feature.organisation.components.SuccessNotice
import com.schoolapp.feature.organisation.sessions.components.SessionCardActions
import com.schoolapp.feature.organisation.sessions.edit.SessionFormSheet
import com.schoolapp.feature.organisation.sessions.events.EventFormSheet
import com.schoolapp.feature.organisation.sessions.terms.TermsSheet
import java.time.LocalDate

@Composable
fun SessionsCalendarRoute(
    modifier: Modifier = Modifier,
    viewModel: SessionsCalendarViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val sessionState by viewModel.sessionEditor.state.collectAsStateWithLifecycle()
    val eventState by viewModel.events.state.collectAsStateWithLifecycle()
    val termsState by viewModel.terms.state.collectAsStateWithLifecycle()
    val sessions = viewModel.sessionEditor
    val events = viewModel.events
    SessionsCalendarScreen(
        state = state,
        modifier = modifier,
        actions = SessionsCalendarActions(
            onBranchSelected = viewModel::onBranchSelected,
            onRetry = viewModel::load,
            onRefresh = viewModel::refresh,
            onShiftMonth = viewModel::shiftMonth,
            onNewSession = sessions::openNew,
            session = SessionCardActions(
                onTerms = { viewModel.terms.open(it, state.canEdit) },
                onEdit = sessions::openEdit.takeIf { state.canEdit },
                onTransition = sessions::askTransition.takeIf { state.canEdit },
            ),
            onAddEvent = { events.openNew(defaultEventDate(state)) },
            onOpenEvent = events::openEdit,
        ),
        notices = if (sessionState.notice != null || eventState.notice != null) {
            {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    SuccessNotice(sessionState.notice, sessions::dismissNotice)
                    SuccessNotice(eventState.notice, events::dismissNotice)
                }
            }
        } else {
            null
        },
    )
    sessionState.form?.let { SessionFormSheet(it, sessions) }
    sessionState.transition?.let { t ->
        ConfirmDialog(
            title = stringResource(if (t.activate) R.string.org_activate_session_title else R.string.org_close_session_title, t.session.name),
            message = t.error?.let { actionErrorMessage(it.error, it.details) }
                ?: stringResource(if (t.activate) R.string.org_activate_session_message else R.string.org_close_session_message),
            confirmLabel = stringResource(if (t.activate) R.string.org_activate else R.string.org_close_session),
            onConfirm = sessions::confirmTransition,
            onDismiss = sessions::dismissTransition,
            destructive = !t.activate,
        )
    }
    termsState?.let { TermsSheet(it, viewModel.terms) }
    eventState.form?.let { form ->
        val existing = form.id?.let { id -> state.events.firstOrNull { it.id == id } }
        EventFormSheet(form, events, onDelete = existing?.let { { events.askDelete(it) } })
    }
    eventState.deleteTarget?.let { event ->
        ConfirmDialog(
            title = stringResource(R.string.org_delete_event_title, event.title),
            message = eventState.deleteError?.let { actionErrorMessage(it.error, it.details) }
                ?: stringResource(if (event.branchId == null) R.string.org_delete_event_school else R.string.org_delete_event_branch),
            confirmLabel = stringResource(R.string.org_delete),
            onConfirm = events::confirmDelete,
            onDismiss = events::dismissDelete,
            destructive = true,
        )
    }
}

/** Today when it falls in the shown month, otherwise that month's first day. */
private fun defaultEventDate(state: SessionsCalendarUiState): String {
    val today = LocalDate.now()
    return if (state.month.year == today.year && state.month.month == today.month) today.toString() else state.month.atDay(1).toString()
}
