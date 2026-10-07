package com.schoolapp.feature.timetable

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import com.schoolapp.core.designsystem.component.AppTabs
import com.schoolapp.feature.timetable.calendar.SchoolCalendarRoute

/**
 * Parent menu `timetable` ("Timetable, Calendar & Activities"): the child's week, the upcoming school
 * calendar and the child's activities ([activitiesContent], supplied by the activities feature).
 */
@Composable
fun ParentTimetableScreen(activitiesContent: @Composable (Modifier) -> Unit, modifier: Modifier = Modifier) {
    var tab by rememberSaveable { mutableIntStateOf(0) }
    Column(modifier.fillMaxSize()) {
        AppTabs(
            titles = listOf(
                stringResource(R.string.timetable_tab_week),
                stringResource(R.string.timetable_tab_calendar),
                stringResource(R.string.timetable_tab_activities),
            ),
            selectedIndex = tab,
            onSelect = { tab = it },
            modifier = Modifier.fillMaxWidth(),
        )
        val content = Modifier.weight(1f)
        when (tab) {
            0 -> TimetableRoute(content, hiltViewModel(key = "timetable_parent_week"))
            1 -> SchoolCalendarRoute(content, hiltViewModel(key = "timetable_parent_calendar"))
            else -> activitiesContent(content)
        }
    }
}
