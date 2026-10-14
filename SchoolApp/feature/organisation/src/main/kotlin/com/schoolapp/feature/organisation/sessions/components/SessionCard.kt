package com.schoolapp.feature.organisation.sessions.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.ListAlt
import androidx.compose.material.icons.outlined.Edit
import androidx.compose.material.icons.outlined.Lock
import androidx.compose.material.icons.outlined.PlayCircleOutline
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.organisation.AcademicSession
import com.schoolapp.core.ui.formatDateRange
import com.schoolapp.core.ui.humanizeKey
import com.schoolapp.feature.organisation.R
import com.schoolapp.feature.organisation.components.recordStatusTone

/** Session actions; [onEdit]/[onTransition] are null when the role can't edit sessions. */
data class SessionCardActions(
    val onTerms: (AcademicSession) -> Unit = {},
    val onEdit: ((AcademicSession) -> Unit)? = null,
    /** `true` = activate a draft, `false` = close the active session. */
    val onTransition: ((AcademicSession, Boolean) -> Unit)? = null,
)

@OptIn(ExperimentalLayoutApi::class)
@Composable
internal fun SessionCard(session: AcademicSession, modifier: Modifier = Modifier, actions: SessionCardActions = SessionCardActions()) {
    val terms = pluralStringResource(R.plurals.org_session_terms, session.termCount, session.termCount)
    val open = session.status != "CLOSED"
    AppCard(modifier.fillMaxWidth(), onClick = { actions.onTerms(session) }) {
        SectionHeader(
            title = session.name,
            subtitle = listOfNotNull(formatDateRange(session.startDate, session.endDate), terms).joinToString(" · "),
            action = { session.status?.let { StatusChip(humanizeKey(it), recordStatusTone(it)) } },
        )
        FlowRow(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
            AppTextButton(
                stringResource(if (open && actions.onEdit != null) R.string.org_manage_terms else R.string.org_view_terms),
                onClick = { actions.onTerms(session) },
                leadingIcon = Icons.AutoMirrored.Outlined.ListAlt,
            )
            if (open) actions.onEdit?.let { edit ->
                AppTextButton(stringResource(R.string.org_edit), onClick = { edit(session) }, leadingIcon = Icons.Outlined.Edit)
            }
            actions.onTransition?.let { transition ->
                when (session.status) {
                    "DRAFT" -> AppTextButton(
                        stringResource(R.string.org_activate),
                        onClick = { transition(session, true) },
                        leadingIcon = Icons.Outlined.PlayCircleOutline,
                    )
                    "ACTIVE" -> AppTextButton(
                        stringResource(R.string.org_close_session),
                        onClick = { transition(session, false) },
                        leadingIcon = Icons.Outlined.Lock,
                        contentColor = AppColors.Error,
                    )
                }
            }
        }
    }
}
