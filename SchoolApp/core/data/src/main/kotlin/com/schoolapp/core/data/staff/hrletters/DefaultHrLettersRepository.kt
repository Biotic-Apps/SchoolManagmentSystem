package com.schoolapp.core.data.staff.hrletters

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.staff.hrletters.HrLetter
import com.schoolapp.core.model.staff.hrletters.HrLetterInput
import com.schoolapp.core.model.staff.hrletters.HrLetterTemplate
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.staff.HrLettersApi
import com.schoolapp.core.network.dto.staff.hrletters.GenerateHrLetterRequest
import com.schoolapp.core.network.dto.staff.hrletters.HrLetterDto
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DefaultHrLettersRepository @Inject constructor(
    private val api: HrLettersApi,
    private val apiCaller: ApiCaller,
) : HrLettersRepository {

    override suspend fun templates(schoolId: String): AppResult<List<HrLetterTemplate>> =
        apiCaller.call { api.templates(schoolId).data.map { HrLetterTemplate(it.id, it.type, it.title) } }

    override suspend fun letters(staffId: String): AppResult<List<HrLetter>> =
        apiCaller.call { api.letters(staffId).data.map { it.toModel() } }

    override suspend fun generate(staffId: String, input: HrLetterInput): AppResult<HrLetter> =
        apiCaller.call {
            val body = GenerateHrLetterRequest(
                templateId = input.templateId,
                subject = input.subject?.trim()?.ifEmpty { null },
                effectiveDate = input.effectiveDate?.ifBlank { null },
            )
            api.generate(staffId, body).data.toModel()
        }

    override suspend fun downloadUrl(letterId: String): AppResult<String> =
        apiCaller.call { api.download(letterId).data.fileUrl }

    private fun HrLetterDto.toModel() = HrLetter(
        id = id,
        templateId = templateId,
        type = type,
        subject = subject,
        fileUrl = fileUrl?.takeIf { it.isNotBlank() },
        issuedAt = issuedAt,
    )
}
