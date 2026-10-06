package com.schoolapp.feature.syllabus.components

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.HorizontalDivider
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.syllabus.PlanProgress
import com.schoolapp.core.model.syllabus.SyllabusChapter
import com.schoolapp.core.model.syllabus.TopicStatus

@Composable
internal fun ChapterCard(
    chapter: SyllabusChapter,
    queuedTopicIds: Set<String>,
    onTopicClick: ((String) -> Unit)?,
    modifier: Modifier = Modifier,
) {
    AppCard(modifier.fillMaxWidth(), contentPadding = 0.dp) {
        SectionHeader(
            title = chapter.title,
            subtitle = progressSummary(chapter.progress()),
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp),
        )
        chapter.topics.forEach { topic ->
            HorizontalDivider(color = AppColors.Border)
            TopicRow(
                topic = topic,
                isQueued = topic.id in queuedTopicIds,
                onClick = onTopicClick?.let { click -> { click(topic.id) } },
            )
        }
    }
}

private fun SyllabusChapter.progress(): PlanProgress {
    val done = topics.count { it.status == TopicStatus.COMPLETED }
    return PlanProgress(topics.size, done, topics.count { it.isDelayed }, if (topics.isEmpty()) 0 else done * 100 / topics.size)
}
