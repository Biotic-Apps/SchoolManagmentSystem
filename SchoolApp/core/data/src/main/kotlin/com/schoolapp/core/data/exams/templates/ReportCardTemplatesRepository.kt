package com.schoolapp.core.data.exams.templates

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.exams.templates.ReportCardTemplate
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.exams.ReportCardTemplatesApi
import com.schoolapp.core.network.dto.exams.templates.ReportCardTemplateDto
import com.schoolapp.core.network.dto.exams.templates.TemplateHeaderDto
import com.schoolapp.core.network.dto.exams.templates.TemplateLayoutDto
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Inject
import javax.inject.Singleton

interface ReportCardTemplatesRepository {
    /** Default first, then by name. */
    suspend fun templates(): AppResult<List<ReportCardTemplate>>

    suspend fun save(template: ReportCardTemplate): AppResult<ReportCardTemplate>

    suspend fun delete(id: String): AppResult<Unit>

    suspend fun setDefault(id: String): AppResult<ReportCardTemplate>
}

@Singleton
class DefaultReportCardTemplatesRepository @Inject constructor(
    private val api: ReportCardTemplatesApi,
    private val apiCaller: ApiCaller,
) : ReportCardTemplatesRepository {
    override suspend fun templates(): AppResult<List<ReportCardTemplate>> = apiCaller.call {
        api.templates().data.mapNotNull { it.toModel() }.sortedWith(compareBy({ !it.isDefault }, { it.name.lowercase() }))
    }

    override suspend fun save(template: ReportCardTemplate): AppResult<ReportCardTemplate> = apiCaller.call {
        val body = template.toDto()
        val saved = if (template.id.isBlank()) api.create(body).data else api.update(template.id, body).data
        saved.toModel() ?: template
    }

    override suspend fun delete(id: String): AppResult<Unit> = apiCaller.call { api.delete(id) }

    override suspend fun setDefault(id: String): AppResult<ReportCardTemplate> = apiCaller.call {
        requireNotNull(api.setDefault(id).data.toModel())
    }
}

private fun ReportCardTemplateDto.toModel(): ReportCardTemplate? = id?.let {
    ReportCardTemplate(
        id = it,
        name = name,
        isDefault = isDefault,
        orientation = layout?.orientation ?: ReportCardTemplate.PORTRAIT,
        paperSize = layout?.paperSize ?: ReportCardTemplate.A4,
        showLogo = header?.showLogo ?: true,
        schoolName = header?.schoolName.orEmpty(),
        subtitle = header?.subtitle.orEmpty(),
        address = header?.address.orEmpty(),
        phone = header?.phone.orEmpty(),
        showGradingScale = showGradingScale,
        showSkills = showSkills,
        showRemarks = showRemarks,
        showAttendance = showAttendance,
        showPosition = showPosition,
        signatures = signatures.orEmpty(),
        footerText = footerText.orEmpty(),
    )
}

private fun ReportCardTemplate.toDto() = ReportCardTemplateDto(
    name = name.trim(),
    isDefault = isDefault,
    layout = TemplateLayoutDto(orientation, paperSize),
    header = TemplateHeaderDto(
        showLogo = showLogo,
        schoolName = schoolName.trim(),
        subtitle = subtitle.trim(),
        address = address.trim(),
        phone = phone.trim(),
    ),
    showGradingScale = showGradingScale,
    showSkills = showSkills,
    showRemarks = showRemarks,
    showAttendance = showAttendance,
    showPosition = showPosition,
    signatures = signatures.map { it.trim() }.filter { it.isNotEmpty() },
    footerText = footerText.trim().takeIf { it.isNotEmpty() },
)

@Module
@InstallIn(SingletonComponent::class)
interface ReportCardTemplatesDataModule {
    @Binds
    fun bindReportCardTemplatesRepository(impl: DefaultReportCardTemplatesRepository): ReportCardTemplatesRepository
}
