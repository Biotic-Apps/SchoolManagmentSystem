package com.schoolapp.feature.complaints.list.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.FilterChipRow
import com.schoolapp.core.designsystem.component.SearchField
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.model.complaint.ComplaintCategory
import com.schoolapp.core.model.complaint.ComplaintStatus
import com.schoolapp.feature.complaints.R
import com.schoolapp.feature.complaints.components.categoryLabel
import com.schoolapp.feature.complaints.components.statusLabel

/** Ticket/subject search plus status and category chips (server filters). */
@Composable
internal fun ComplaintFilters(
    search: String,
    status: ComplaintStatus?,
    category: ComplaintCategory?,
    onSearchChange: (String) -> Unit,
    onStatus: (ComplaintStatus?) -> Unit,
    onCategory: (ComplaintCategory?) -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        SearchField(
            value = search,
            onValueChange = onSearchChange,
            placeholder = stringResource(R.string.complaints_search),
            modifier = Modifier.fillMaxWidth(),
        )
        FilterChipRow(
            options = listOf(SwitcherOption(ALL, stringResource(R.string.complaints_all_statuses))) +
                ComplaintStatus.entries.map { SwitcherOption(it.name, statusLabel(it)) },
            selectedId = status?.name ?: ALL,
            onSelect = { id -> onStatus(ComplaintStatus.entries.firstOrNull { it.name == id }) },
        )
        FilterChipRow(
            options = listOf(SwitcherOption(ALL, stringResource(R.string.complaints_all_categories))) +
                ComplaintCategory.entries.map { SwitcherOption(it.name, categoryLabel(it)) },
            selectedId = category?.name ?: ALL,
            onSelect = { id -> onCategory(ComplaintCategory.entries.firstOrNull { it.name == id }) },
        )
    }
}

private const val ALL = "ALL"
