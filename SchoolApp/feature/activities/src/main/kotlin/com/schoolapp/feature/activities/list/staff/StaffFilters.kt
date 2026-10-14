package com.schoolapp.feature.activities.list.staff

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.FilterChipRow
import com.schoolapp.core.designsystem.component.SegmentedChoice
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.model.activity.ActivityStatus
import com.schoolapp.core.model.activity.ActivityType
import com.schoolapp.feature.activities.R
import com.schoolapp.feature.activities.components.labelRes

/** List / Calendar switch, then type and status chips ("All" clears each). */
@Composable
internal fun StaffFilters(
    state: StaffActivitiesUiState,
    onView: (StaffView) -> Unit,
    onType: (ActivityType?) -> Unit,
    onStatus: (ActivityStatus?) -> Unit,
    modifier: Modifier = Modifier,
) {
    val all = stringResource(R.string.activities_filter_all)
    Column(modifier, verticalArrangement = Arrangement.spacedBy(8.dp)) {
        SegmentedChoice(
            labels = listOf(stringResource(R.string.activities_view_list), stringResource(R.string.activities_view_calendar)),
            selectedIndex = state.view.ordinal,
            onSelect = { onView(StaffView.entries[it]) },
        )
        FilterChipRow(
            options = listOf(SwitcherOption(ALL, all)) + ActivityType.entries.map { SwitcherOption(it.name, stringResource(it.labelRes())) },
            selectedId = state.filter.type?.name ?: ALL,
            onSelect = { id -> onType(ActivityType.entries.firstOrNull { it.name == id }) },
        )
        FilterChipRow(
            options = listOf(SwitcherOption(ALL, all)) + ActivityStatus.entries.map { SwitcherOption(it.name, stringResource(it.labelRes())) },
            selectedId = state.filter.status?.name ?: ALL,
            onSelect = { id -> onStatus(ActivityStatus.entries.firstOrNull { it.name == id }) },
        )
    }
}

private const val ALL = "ALL"
