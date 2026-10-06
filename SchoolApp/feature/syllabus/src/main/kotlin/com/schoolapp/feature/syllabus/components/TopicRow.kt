package com.schoolapp.feature.syllabus.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.ListItemRow
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.syllabus.SyllabusTopic
import com.schoolapp.core.ui.formatDate
import com.schoolapp.feature.syllabus.R

@Composable
internal fun TopicRow(
    topic: SyllabusTopic,
    isQueued: Boolean,
    onClick: (() -> Unit)?,
    modifier: Modifier = Modifier,
) {
    val dateLine = when {
        topic.completedOn != null -> stringResource(R.string.syllabus_done_on, formatDate(topic.completedOn).orEmpty())
        topic.targetDate != null -> stringResource(R.string.syllabus_target, formatDate(topic.targetDate).orEmpty())
        else -> null
    }
    ListItemRow(
        title = topic.title,
        supporting = dateLine,
        onClick = onClick,
        modifier = modifier,
        trailing = {
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                FlowRow(horizontalArrangement = Arrangement.spacedBy(4.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    StatusChip(topicStatusLabel(topic.status), topic.status.tone())
                    if (topic.isDelayed) StatusChip(stringResource(R.string.syllabus_delayed), StatusTone.Error)
                }
                if (topic.pendingReview) StatusChip(stringResource(R.string.syllabus_pending_review), StatusTone.Warning)
                if (isQueued) StatusChip(stringResource(R.string.syllabus_waiting_sync), StatusTone.Info)
            }
        },
    )
}
