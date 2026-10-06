package com.schoolapp.feature.students.link

import com.schoolapp.core.model.people.GuardianRelation
import java.time.LocalDate

enum class LinkFieldError { ADMISSION_REQUIRED, DOB_REQUIRED, DOB_IN_FUTURE, RELATION_REQUIRED, CODE_INVALID }

internal object LinkChildValidator {
    private val CodePattern = Regex("^[0-9]{4,8}$")

    fun validateDetails(admissionNo: String, dob: String?, relation: GuardianRelation?, today: LocalDate): Set<LinkFieldError> =
        buildSet {
            if (admissionNo.isBlank()) add(LinkFieldError.ADMISSION_REQUIRED)
            val date = dob?.let { runCatching { LocalDate.parse(it) }.getOrNull() }
            when {
                date == null -> add(LinkFieldError.DOB_REQUIRED)
                date.isAfter(today) -> add(LinkFieldError.DOB_IN_FUTURE)
            }
            if (relation == null) add(LinkFieldError.RELATION_REQUIRED)
        }

    fun validateCode(code: String): LinkFieldError? = if (CodePattern.matches(code.trim())) null else LinkFieldError.CODE_INVALID
}
