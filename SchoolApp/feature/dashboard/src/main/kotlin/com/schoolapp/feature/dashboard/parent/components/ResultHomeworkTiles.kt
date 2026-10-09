package com.schoolapp.feature.dashboard.parent.components

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.MenuBook
import androidx.compose.material.icons.outlined.EmojiEvents
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.StatCard
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.dashboard.HomeworkDue
import com.schoolapp.core.model.dashboard.LatestResult
import com.schoolapp.core.ui.formatDate
import com.schoolapp.feature.dashboard.R
import com.schoolapp.feature.dashboard.parent.percentText

/** Latest published exam: percentage, exam name with grade, and position when ranked. */
@Composable
internal fun ResultTile(result: LatestResult?, onClick: (() -> Unit)?, modifier: Modifier = Modifier) {
    val supporting = result?.let {
        listOfNotNull(
            stringResource(R.string.dashboard_kpi_result_detail, it.examName, it.grade),
            it.position?.let { position -> stringResource(R.string.dashboard_kpi_result_position, position) },
        ).joinToString(" · ")
    } ?: stringResource(R.string.dashboard_kpi_result_none)
    StatCard(
        label = stringResource(R.string.dashboard_kpi_result),
        value = result?.let { percentText(it.percent) } ?: stringResource(R.string.dashboard_kpi_no_value),
        icon = Icons.Outlined.EmojiEvents,
        tone = when {
            result == null -> StatusTone.Neutral
            result.passed -> StatusTone.Info
            else -> StatusTone.Error
        },
        supporting = supporting,
        onClick = onClick,
        modifier = modifier,
    )
}

/** Homework still due and the nearest due date. */
@Composable
internal fun HomeworkTile(homework: HomeworkDue, onClick: (() -> Unit)?, modifier: Modifier = Modifier) {
    StatCard(
        label = stringResource(R.string.dashboard_kpi_homework),
        value = homework.dueCount.toString(),
        icon = Icons.AutoMirrored.Outlined.MenuBook,
        tone = if (homework.dueCount > 0) StatusTone.Warning else StatusTone.Success,
        supporting = formatDate(homework.nextDueDate)?.let { stringResource(R.string.dashboard_kpi_homework_next, it) }
            ?: stringResource(R.string.dashboard_kpi_homework_none),
        onClick = onClick,
        modifier = modifier,
    )
}
