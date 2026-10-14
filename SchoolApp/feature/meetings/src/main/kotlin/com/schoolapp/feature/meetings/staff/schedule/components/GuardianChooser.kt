package com.schoolapp.feature.meetings.staff.schedule.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Person
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.ListItemRow
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.people.GuardianLink
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.meetings.R

/** The student's verified guardians; the meeting is with the one picked. */
@Composable
internal fun GuardianChooser(
    guardians: List<GuardianLink>,
    selectedGuardianId: String?,
    isLoading: Boolean,
    error: AppError?,
    missing: Boolean,
    enabled: Boolean,
    onSelect: (String) -> Unit,
    onRetry: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(modifier, verticalArrangement = Arrangement.spacedBy(8.dp)) {
        SectionHeader(stringResource(R.string.meetings_guardian))
        when {
            isLoading -> LoadingState(rows = 2)
            error != null -> {
                InlineMessage(appErrorMessage(error), StatusTone.Error)
                AppTextButton(stringResource(R.string.meetings_retry), onRetry)
            }
            guardians.isEmpty() -> InlineMessage(stringResource(R.string.meetings_no_verified_guardians), StatusTone.Warning)
            else -> {
                if (missing) InlineMessage(stringResource(R.string.meetings_pick_guardian), StatusTone.Error)
                guardians.forEach { link ->
                    ListItemRow(
                        title = link.guardian.name,
                        supporting = (link.relation ?: link.guardian.relation)?.humanize(),
                        leadingIcon = Icons.Outlined.Person,
                        selected = link.guardian.id == selectedGuardianId,
                        onClick = if (enabled) ({ onSelect(link.guardian.id) }) else null,
                    )
                }
            }
        }
    }
}

private fun String.humanize(): String = lowercase().replace('_', ' ').replaceFirstChar { it.uppercase() }
