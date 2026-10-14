package com.schoolapp.core.data.staff.hrletters

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.staff.hrletters.HrLetter
import com.schoolapp.core.model.staff.hrletters.HrLetterInput
import com.schoolapp.core.model.staff.hrletters.HrLetterTemplate

interface HrLettersRepository {
    /** Active templates of [schoolId]. */
    suspend fun templates(schoolId: String): AppResult<List<HrLetterTemplate>>

    suspend fun letters(staffId: String): AppResult<List<HrLetter>>

    /** Renders the letter synchronously and returns it (`staff.edit`). */
    suspend fun generate(staffId: String, input: HrLetterInput): AppResult<HrLetter>

    /** Freshly signed PDF link for a letter. */
    suspend fun downloadUrl(letterId: String): AppResult<String>
}
