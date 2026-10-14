package com.schoolapp.feature.organisation.sessions.terms

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material.icons.outlined.DeleteOutline
import androidx.compose.material.icons.outlined.Edit
import androidx.compose.material.icons.automirrored.outlined.EventNote
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.ConfirmDialog
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.ListItemRow
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.organisation.SessionTerm
import com.schoolapp.core.ui.actionErrorMessage
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.formatDateRange
import com.schoolapp.feature.organisation.R
import com.schoolapp.feature.organisation.components.SuccessNotice
import com.schoolapp.feature.organisation.sessions.edit.RangeFormFields

/** Terms of a session: list, add, edit and remove (read-only once the session is closed). */
@Composable
internal fun TermsSheet(state: TermsState, editor: TermsEditor) {
    val session = state.session
    AppBottomSheet(title = stringResource(R.string.org_terms_of, session.name), onDismiss = editor::close) {
        formatDateRange(session.startDate, session.endDate)?.let { InlineMessage(it, StatusTone.Info) }
        if (session.status == "CLOSED") InlineMessage(stringResource(R.string.org_session_closed_terms), StatusTone.Neutral)
        SuccessNotice(state.notice, editor::dismissNotice)
        val form = state.form
        val terms = state.terms
        when {
            form != null -> {
                RangeFormFields(
                    form = form,
                    nameLabel = stringResource(R.string.org_term_name),
                    namePlaceholder = stringResource(R.string.org_term_name_hint),
                    onEdit = editor::editForm,
                    minDate = session.startDate,
                    maxDate = session.endDate,
                )
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    SecondaryButton(stringResource(R.string.org_cancel), onClick = editor::dismissForm, modifier = Modifier.weight(1f))
                    PrimaryButton(
                        stringResource(if (form.isNew) R.string.org_add_term else R.string.org_save),
                        onClick = editor::saveForm,
                        loading = form.saving,
                        modifier = Modifier.weight(1f),
                    )
                }
            }
            terms != null -> TermList(state, terms, editor)
            state.loadError != null -> ErrorState(appErrorMessage(state.loadError), onRetry = editor::load)
            else -> LoadingState()
        }
    }
    state.deleteTarget?.let { term ->
        ConfirmDialog(
            title = stringResource(R.string.org_remove_term_title, term.name),
            message = state.deleteError?.let { actionErrorMessage(it.error, it.details) } ?: stringResource(R.string.org_remove_term_message),
            confirmLabel = stringResource(R.string.org_remove),
            onConfirm = editor::confirmDelete,
            onDismiss = editor::dismissDelete,
            destructive = true,
        )
    }
}

@Composable
private fun TermList(state: TermsState, terms: List<SessionTerm>, editor: TermsEditor) {
    if (terms.isEmpty()) {
        EmptyState(
            title = stringResource(R.string.org_terms_empty),
            message = stringResource(R.string.org_terms_empty_hint),
            icon = Icons.AutoMirrored.Outlined.EventNote,
        )
    }
    terms.forEach { term ->
        ListItemRow(
            title = term.name,
            supporting = formatDateRange(term.startDate, term.endDate),
            leadingIcon = Icons.AutoMirrored.Outlined.EventNote,
            onClick = if (state.editable) ({ editor.openForm(term) }) else null,
            trailing = if (state.editable) {
                {
                    Row {
                        IconButton(onClick = { editor.openForm(term) }) {
                            Icon(Icons.Outlined.Edit, contentDescription = stringResource(R.string.org_edit_named, term.name))
                        }
                        IconButton(onClick = { editor.askDelete(term) }) {
                            Icon(Icons.Outlined.DeleteOutline, contentDescription = stringResource(R.string.org_remove_named, term.name), tint = AppColors.Error)
                        }
                    }
                }
            } else {
                null
            },
        )
    }
    if (state.editable) {
        PrimaryButton(stringResource(R.string.org_add_term), onClick = { editor.openForm(null) }, leadingIcon = Icons.Outlined.Add)
    }
}
