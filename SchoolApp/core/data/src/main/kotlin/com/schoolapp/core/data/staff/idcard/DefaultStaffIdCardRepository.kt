package com.schoolapp.core.data.staff.idcard

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.staff.idcard.IdCardStatus
import com.schoolapp.core.model.staff.idcard.StaffIdCard
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.staff.StaffIdCardApi
import com.schoolapp.core.network.dto.staff.idcard.StaffIdCardDto
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DefaultStaffIdCardRepository @Inject constructor(
    private val api: StaffIdCardApi,
    private val apiCaller: ApiCaller,
) : StaffIdCardRepository {

    override suspend fun card(staffId: String): AppResult<StaffIdCard?> =
        when (val result = apiCaller.call { api.status(staffId).data.toModel() }) {
            is AppResult.Success -> result
            is AppResult.Failure -> if (result.error.isNotFound()) AppResult.Success(null) else result
        }

    override suspend fun generate(staffId: String): AppResult<Unit> =
        apiCaller.call { api.generate(staffId); Unit }

    private fun AppError.isNotFound(): Boolean = this is AppError.Server && (httpCode == NOT_FOUND || code == "NOT_FOUND")

    private fun StaffIdCardDto.toModel() = StaffIdCard(
        status = IdCardStatus.entries.firstOrNull { it.name == status } ?: IdCardStatus.UNKNOWN,
        fileUrl = fileUrl?.takeIf { it.isNotBlank() },
        version = version,
        generatedAt = generatedAt,
    )

    private companion object {
        const val NOT_FOUND = 404
    }
}
