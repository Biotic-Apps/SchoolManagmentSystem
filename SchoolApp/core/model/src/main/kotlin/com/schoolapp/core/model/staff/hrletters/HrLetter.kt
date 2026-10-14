package com.schoolapp.core.model.staff.hrletters

/** Server letter type key: EXPERIENCE, SALARY_CERTIFICATE, RELIEVING or CUSTOM. */
data class HrLetter(
    val id: String,
    val templateId: String,
    val type: String,
    val subject: String,
    val fileUrl: String?,
    val issuedAt: String,
)

data class HrLetterTemplate(
    val id: String,
    val type: String,
    val title: String,
)

/** Blank [subject] / null [effectiveDate] let the server use the template defaults. */
data class HrLetterInput(
    val templateId: String,
    val subject: String?,
    val effectiveDate: String?,
)
