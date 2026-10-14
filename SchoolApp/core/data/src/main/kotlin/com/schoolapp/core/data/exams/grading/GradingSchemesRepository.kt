package com.schoolapp.core.data.exams.grading

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.common.clean
import com.schoolapp.core.model.common.enumOrDefault
import com.schoolapp.core.model.exams.grading.GradeBand
import com.schoolapp.core.model.exams.grading.GradingScheme
import com.schoolapp.core.model.exams.grading.GradingSchemeInput
import com.schoolapp.core.model.exams.grading.GradingSchemeStatus
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.exams.GradingSchemesApi
import com.schoolapp.core.network.dto.exams.grading.GradeBandDto
import com.schoolapp.core.network.dto.exams.grading.GradingSchemeCreateBodyDto
import com.schoolapp.core.network.dto.exams.grading.GradingSchemeDto
import com.schoolapp.core.network.dto.exams.grading.GradingSchemeUpdateBodyDto
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Inject
import javax.inject.Singleton

interface GradingSchemesRepository {
    suspend fun schemes(sessionId: String? = null): AppResult<List<GradingScheme>>

    suspend fun create(input: GradingSchemeInput): AppResult<GradingScheme>

    /** 409 once an exam using it has approved results. */
    suspend fun update(id: String, input: GradingSchemeInput): AppResult<GradingScheme>

    suspend fun approve(id: String): AppResult<GradingScheme>
}

@Singleton
class DefaultGradingSchemesRepository @Inject constructor(
    private val api: GradingSchemesApi,
    private val apiCaller: ApiCaller,
) : GradingSchemesRepository {
    override suspend fun schemes(sessionId: String?): AppResult<List<GradingScheme>> =
        apiCaller.call { api.schemes(sessionId = sessionId).data.map { it.toModel() }.sortedBy { it.name.lowercase() } }

    override suspend fun create(input: GradingSchemeInput): AppResult<GradingScheme> = apiCaller.call {
        api.create(
            GradingSchemeCreateBodyDto(input.schoolId, input.sessionId, input.name.trim(), input.passPercent, input.bands.map { it.toDto() }),
        ).data.toModel()
    }

    override suspend fun update(id: String, input: GradingSchemeInput): AppResult<GradingScheme> = apiCaller.call {
        api.update(id, GradingSchemeUpdateBodyDto(input.name.trim(), input.passPercent, input.bands.map { it.toDto() })).data.toModel()
    }

    override suspend fun approve(id: String): AppResult<GradingScheme> = apiCaller.call { api.approve(id).data.toModel() }
}

internal fun GradingSchemeDto.toModel() = GradingScheme(
    id = id,
    schoolId = schoolId,
    sessionId = sessionId,
    name = name,
    passPercent = passPercent,
    status = enumOrDefault(status, GradingSchemeStatus.DRAFT),
    approvedAt = approvedAt,
    bands = bands.map { GradeBand(it.grade, it.minPercent, it.maxPercent, it.remark.clean(), it.gradePoint) }
        .sortedByDescending { it.minPercent },
)

private fun GradeBand.toDto() = GradeBandDto(grade.trim(), minPercent, maxPercent, remark.clean(), gradePoint)

@Module
@InstallIn(SingletonComponent::class)
interface GradingSchemesDataModule {
    @Binds
    fun bindGradingSchemesRepository(impl: DefaultGradingSchemesRepository): GradingSchemesRepository
}
