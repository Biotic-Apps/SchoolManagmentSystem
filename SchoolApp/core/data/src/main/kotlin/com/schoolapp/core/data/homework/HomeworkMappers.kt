package com.schoolapp.core.data.homework

import com.schoolapp.core.data.common.toAttachments
import com.schoolapp.core.data.common.toRef
import com.schoolapp.core.model.homework.Homework
import com.schoolapp.core.model.homework.HomeworkStatus
import com.schoolapp.core.model.homework.HomeworkSubmission
import com.schoolapp.core.model.homework.SubmissionStatus
import com.schoolapp.core.model.organisation.Subject
import com.schoolapp.core.network.homework.HomeworkDto
import com.schoolapp.core.network.homework.HomeworkSubjectDto
import com.schoolapp.core.network.homework.HomeworkSubmissionDto

internal fun HomeworkDto.toModel() = Homework(
    id = id,
    classId = classId,
    sectionId = sectionId,
    className = className,
    sectionName = sectionName,
    subjectId = subject?.id,
    subjectName = subject?.name.orEmpty(),
    title = title,
    description = description,
    dueDate = dueDate,
    maxMarks = maxMarks,
    attachments = attachments.toAttachments(),
    assignedBy = assignedBy?.toRef(),
    status = HomeworkStatus.entries.firstOrNull { it.name == status } ?: HomeworkStatus.UNKNOWN,
    submissionCount = submissionCount,
    gradedCount = gradedCount,
    createdAt = createdAt,
)

internal fun HomeworkSubmissionDto.toModel() = HomeworkSubmission(
    id = id,
    homeworkId = homeworkId,
    student = student?.toRef(),
    submittedAt = submittedAt,
    text = text,
    attachments = attachments.toAttachments(),
    marks = marks,
    grade = grade,
    feedback = feedback,
    gradedBy = gradedBy?.toRef(),
    gradedAt = gradedAt,
    status = SubmissionStatus.entries.firstOrNull { it.name == status } ?: SubmissionStatus.UNKNOWN,
)

internal fun HomeworkSubjectDto.toModel() = Subject(id, code, name)
