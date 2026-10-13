package com.schoolapp.feature.exams.board.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.IntrinsicSize
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.height
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.feature.exams.R
import com.schoolapp.feature.exams.board.CompletenessCounts
import com.schoolapp.feature.exams.components.CountTile

/** Accepted / submitted / draft / not entered counts of the selected exam. */
@Composable
internal fun CompletenessSummary(counts: CompletenessCounts, modifier: Modifier = Modifier) {
    Row(modifier.height(IntrinsicSize.Min), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        CountTile(stringResource(R.string.exams_status_accepted), counts.accepted, StatusTone.Success, Modifier.weight(1f))
        CountTile(stringResource(R.string.exams_status_submitted), counts.submitted, StatusTone.Info, Modifier.weight(1f))
        CountTile(stringResource(R.string.exams_status_draft), counts.draft, StatusTone.Warning, Modifier.weight(1f))
        CountTile(stringResource(R.string.exams_status_not_entered), counts.notEntered, StatusTone.Neutral, Modifier.weight(1f))
    }
}
