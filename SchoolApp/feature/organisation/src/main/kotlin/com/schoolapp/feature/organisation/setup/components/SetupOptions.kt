package com.schoolapp.feature.organisation.setup.components

import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.PickerOption
import com.schoolapp.core.model.academics.Room
import com.schoolapp.core.model.academics.TeachingStaff
import com.schoolapp.feature.organisation.R

/** Teachers sorted by [preferred] first (already teach this class), each with "placed/allocated periods". */
@Composable
internal fun teacherOptions(staff: List<TeachingStaff>, preferred: Set<String> = emptySet()): List<PickerOption> {
    val load = staff.associate { it.id to stringResource(R.string.org_teacher_load, it.placedPeriods, it.allocatedPeriods) }
    return staff.sortedWith(compareBy({ it.id !in preferred }, { it.name.lowercase() }))
        .map { PickerOption(it.id, it.name, load[it.id]) }
}

internal fun roomOptions(rooms: List<Room>): List<PickerOption> = rooms.map { PickerOption(it.id, it.name) }
