package com.schoolapp.feature.admin.schools.components

import androidx.compose.runtime.Composable
import androidx.compose.runtime.ReadOnlyComposable
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.schools.School
import com.schoolapp.core.ui.humanizeKey
import com.schoolapp.feature.admin.R

@Composable
@ReadOnlyComposable
internal fun schoolStatusLabel(status: String): String = when (status) {
    School.STATUS_ACTIVE -> stringResource(R.string.schools_status_active)
    School.STATUS_ARCHIVED -> stringResource(R.string.schools_status_archived)
    else -> humanizeKey(status)
}

internal fun schoolStatusTone(status: String): StatusTone =
    if (status == School.STATUS_ACTIVE) StatusTone.Success else StatusTone.Neutral
