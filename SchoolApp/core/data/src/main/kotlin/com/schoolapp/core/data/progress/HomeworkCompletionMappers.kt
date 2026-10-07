package com.schoolapp.core.data.progress

import com.schoolapp.core.model.common.enumOrNull
import com.schoolapp.core.model.progress.HomeworkCompletionItem
import com.schoolapp.core.model.progress.HomeworkStatus
import com.schoolapp.core.network.dto.progress.HomeworkItemDto

/** [index] keeps ids unique when the server omits the diary entry id. */
internal fun HomeworkItemDto.toModel(index: Int) = HomeworkCompletionItem(
    id = diaryEntryId ?: id ?: "$date:$index",
    date = date,
    dueDate = dueDate,
    subjectName = subject?.name?.takeIf { it.isNotBlank() } ?: subjectName,
    homework = homework.orEmpty().trim(),
    status = enumOrNull<HomeworkStatus>(status),
)
