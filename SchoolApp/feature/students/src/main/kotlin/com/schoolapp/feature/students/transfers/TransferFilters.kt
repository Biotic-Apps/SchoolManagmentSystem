package com.schoolapp.feature.students.transfers

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.FilterChipRow
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.model.transfers.TransferDirection
import com.schoolapp.core.model.transfers.TransferFilter
import com.schoolapp.core.model.transfers.TransferStatus
import com.schoolapp.core.ui.humanizeKey
import com.schoolapp.feature.students.R

/** Direction (Incoming by default) and status chips. */
@Composable
internal fun TransferFilters(
    filter: TransferFilter,
    onDirection: (TransferDirection?) -> Unit,
    onStatus: (TransferStatus?) -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(modifier, verticalArrangement = Arrangement.spacedBy(8.dp)) {
        FilterChipRow(
            options = listOf(
                SwitcherOption(TransferDirection.IN.name, stringResource(R.string.students_incoming)),
                SwitcherOption(TransferDirection.OUT.name, stringResource(R.string.students_outgoing)),
                SwitcherOption(BOTH, stringResource(R.string.students_both_directions)),
            ),
            selectedId = filter.direction?.name ?: BOTH,
            onSelect = { id -> onDirection(TransferDirection.entries.firstOrNull { it.name == id }) },
        )
        FilterChipRow(
            options = listOf(SwitcherOption(BOTH, stringResource(R.string.students_all_statuses))) +
                STATUSES.map { SwitcherOption(it.name, humanizeKey(it.name)) },
            selectedId = filter.status?.name ?: BOTH,
            onSelect = { id -> onStatus(STATUSES.firstOrNull { it.name == id }) },
        )
    }
}

private const val BOTH = "all"
private val STATUSES = listOf(TransferStatus.REQUESTED, TransferStatus.ACCEPTED, TransferStatus.REJECTED, TransferStatus.CANCELLED)
