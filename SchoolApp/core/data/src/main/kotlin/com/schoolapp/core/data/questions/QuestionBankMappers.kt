package com.schoolapp.core.data.questions

import com.schoolapp.core.model.questions.Difficulty
import com.schoolapp.core.model.questions.ExamPaper
import com.schoolapp.core.model.questions.GeneratePaperInput
import com.schoolapp.core.model.questions.PaperSection
import com.schoolapp.core.model.questions.PaperStatus
import com.schoolapp.core.model.questions.Question
import com.schoolapp.core.model.questions.QuestionInput
import com.schoolapp.core.model.questions.QuestionType
import com.schoolapp.core.network.dto.questions.CreateQuestionRequest
import com.schoolapp.core.network.dto.questions.ExamPaperDto
import com.schoolapp.core.network.dto.questions.GenerateExamPaperRequest
import com.schoolapp.core.network.dto.questions.GenerateSectionRequest
import com.schoolapp.core.network.dto.questions.QuestionDto
import com.schoolapp.core.network.dto.questions.UpdateQuestionRequest

internal fun QuestionDto.toModel() = Question(
    id = id,
    schoolId = schoolId,
    subjectId = subjectId,
    classId = classId,
    subjectName = subject?.name,
    className = `class`?.name,
    chapterName = chapterName,
    type = QuestionType.from(questionType),
    difficulty = Difficulty.from(difficultyLevel),
    marks = marks,
    text = questionText,
    options = options.orEmpty(),
    correctAnswer = correctAnswer,
    createdAt = createdAt,
)

internal fun ExamPaperDto.toModel() = ExamPaper(
    id = id,
    schoolId = schoolId,
    subjectId = subjectId,
    classId = classId,
    subjectName = subject?.name,
    className = `class`?.name,
    title = title,
    totalMarks = totalMarks,
    durationMinutes = duration,
    sections = sections.map { PaperSection(it.title, it.questionIds, it.marks) },
    status = PaperStatus.from(status),
    createdAt = createdAt,
)

private fun QuestionInput.cleanOptions(): List<String> =
    if (type == QuestionType.MCQ) options.map { it.trim() }.filter { it.isNotEmpty() } else emptyList()

internal fun QuestionInput.toCreateRequest() = CreateQuestionRequest(
    schoolId = schoolId,
    subjectId = subjectId,
    classId = classId,
    chapterName = chapterName.trim(),
    questionType = type.key,
    difficultyLevel = difficulty.key,
    marks = marks,
    questionText = text.trim(),
    options = cleanOptions().takeIf { it.isNotEmpty() },
    correctAnswer = correctAnswer.trim(),
)

/** Non-MCQ edits send an empty option list so the choices of a former MCQ are cleared. */
internal fun QuestionInput.toUpdateRequest() = UpdateQuestionRequest(
    chapterName = chapterName.trim(),
    questionType = type.key,
    difficultyLevel = difficulty.key,
    marks = marks,
    questionText = text.trim(),
    options = cleanOptions(),
    correctAnswer = correctAnswer.trim(),
)

internal fun GeneratePaperInput.toRequest() = GenerateExamPaperRequest(
    schoolId = schoolId,
    subjectId = subjectId,
    classId = classId,
    title = title.trim(),
    totalMarks = totalMarks,
    duration = durationMinutes,
    sections = sections.map {
        GenerateSectionRequest(it.title.trim(), it.questionCount, it.type.key, it.difficulty.key, it.marksPerQuestion)
    },
)
