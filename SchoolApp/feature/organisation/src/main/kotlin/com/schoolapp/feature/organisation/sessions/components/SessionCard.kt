package com.schoolapp.feature.organisation.sessions.components

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.pluralStringResource
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.model.organisation.AcademicSession
import com.schoolapp.core.ui.formatDateRange
import com.schoolapp.core.ui.humanizeKey
import com.schoolapp.feature.organisation.R
import com.schoolapp.feature.organisation.components.recordStatusTone

@Composable
internal fun SessionCard(session: AcademicSession, modifier: Modifier = Modifier) {
    val terms = pluralStringResource(R.plurals.org_session_terms, session.termCount, session.termCount)
    AppCard(modifier.fillMaxWidth()) {
        SectionHeader(
            title = session.name,
            subtitle = listOfNotNull(formatDateRange(session.startDate, session.endDate), terms).joinToString(" · "),
            action = { session.status?.let { StatusChip(humanizeKey(it), recordStatusTone(it)) } },
        )
    }
}
