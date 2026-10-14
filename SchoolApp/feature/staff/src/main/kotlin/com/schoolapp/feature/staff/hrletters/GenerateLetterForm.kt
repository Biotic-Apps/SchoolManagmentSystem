package com.schoolapp.feature.staff.hrletters

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.staff.hrletters.HrLetterInput

enum class SubjectError { TOO_SHORT, TOO_LONG }

/** Generate-letter sheet state; mirrors the web `generateLetterSchema` (template required, subject 2–200 when given). */
data class GenerateLetterForm(
    val templateId: String? = null,
    val subject: String = "",
    /** `YYYY-MM-DD` or null. */
    val effectiveDate: String? = null,
    val templateMissing: Boolean = false,
    val subjectError: SubjectError? = null,
    /** Server validation lines keyed by field (`subject`, `effectiveDate`, `templateId`). */
    val serverErrors: Map<String, String> = emptyMap(),
    val isSaving: Boolean = false,
    val error: AppError? = null,
) {
    /** Same form with inline errors set; [isValid] tells whether it can be sent. */
    fun validated(): GenerateLetterForm {
        val trimmed = subject.trim()
        val subjectError = when {
            trimmed.isEmpty() -> null
            trimmed.length < SUBJECT_MIN -> SubjectError.TOO_SHORT
            trimmed.length > SUBJECT_MAX -> SubjectError.TOO_LONG
            else -> null
        }
        return copy(templateMissing = templateId == null, subjectError = subjectError)
    }

    val isValid: Boolean get() = !templateMissing && subjectError == null

    fun toInput(): HrLetterInput? = templateId?.let { HrLetterInput(it, subject.trim().ifEmpty { null }, effectiveDate) }

    companion object {
        const val SUBJECT_MIN = 2
        const val SUBJECT_MAX = 200
    }
}
