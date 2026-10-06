package com.schoolapp.core.data.progress

import com.schoolapp.core.data.common.toRef
import com.schoolapp.core.model.common.enumOrDefault
import com.schoolapp.core.model.progress.ProgressCategory
import com.schoolapp.core.model.progress.ProgressNote
import com.schoolapp.core.network.dto.progress.ProgressNoteDto

internal fun ProgressNoteDto.toModel(fallbackStudentId: String) = ProgressNote(
    id = id,
    studentId = studentId ?: fallbackStudentId,
    category = enumOrDefault(category, ProgressCategory.LEARNING),
    note = note,
    visibleToParent = visibleToParent,
    author = (author ?: createdBy)?.toRef(),
    createdAt = createdAt,
)
