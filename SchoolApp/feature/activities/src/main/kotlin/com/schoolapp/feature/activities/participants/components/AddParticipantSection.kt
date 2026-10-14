package com.schoolapp.feature.activities.participants.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.PersonAdd
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.ListItemRow
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.PersonAvatar
import com.schoolapp.core.designsystem.component.SearchField
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.activities.R
import com.schoolapp.feature.activities.participants.Candidate
import com.schoolapp.feature.activities.participants.ParticipantsEditorUiState

/** Consent activities add from granted consents only; others search any student in scope. */
@Composable
internal fun AddParticipantSection(
    state: ParticipantsEditorUiState,
    enabled: Boolean,
    onSearch: (String) -> Unit,
    onAdd: (Candidate) -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(modifier, verticalArrangement = Arrangement.spacedBy(8.dp)) {
        SectionHeader(stringResource(R.string.activities_participant_add))
        if (state.consentRequired) {
            if (state.granted.isEmpty()) {
                Text(stringResource(R.string.activities_participant_no_granted), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
            } else {
                Text(stringResource(R.string.activities_participant_granted_hint), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
                CandidateList(state.granted, enabled, onAdd)
            }
            return@Column
        }
        SearchField(value = state.search, onValueChange = onSearch, placeholder = stringResource(R.string.activities_participant_search))
        state.searchError?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
        if (state.isSearching) LoadingState(rows = 2)
        if (!state.isSearching && state.search.trim().length >= 2 && state.results.isEmpty() && state.searchError == null) {
            Text(stringResource(R.string.activities_participant_no_results), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
        }
        if (state.results.isNotEmpty()) CandidateList(state.results, enabled, onAdd)
    }
}

@Composable
private fun CandidateList(candidates: List<Candidate>, enabled: Boolean, onAdd: (Candidate) -> Unit) {
    AppCard(contentPadding = 4.dp) {
        candidates.forEach { candidate ->
            ListItemRow(
                title = candidate.name,
                supporting = candidate.detail?.takeIf { it.isNotBlank() },
                leading = { PersonAvatar(candidate.name, null) },
                trailing = { Icon(Icons.Outlined.PersonAdd, stringResource(R.string.activities_participant_add), tint = AppColors.Primary) },
                onClick = if (enabled) ({ onAdd(candidate) }) else null,
            )
        }
    }
}
