package com.schoolapp.core.network.api.exams

import com.schoolapp.core.network.dto.exams.templates.ReportCardTemplateDto
import com.schoolapp.core.network.model.ApiEnvelope
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import kotlinx.serialization.json.JsonObject
import retrofit2.Retrofit
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.PATCH
import retrofit2.http.POST
import retrofit2.http.Path
import javax.inject.Singleton

/** Report card templates (`exams.view` list, `exams.add` create, `exams.edit` update / default, `exams.delete`). */
interface ReportCardTemplatesApi {
    @GET("report-card-templates")
    suspend fun templates(): ApiEnvelope<List<ReportCardTemplateDto>>

    @POST("report-card-templates")
    suspend fun create(@Body body: ReportCardTemplateDto): ApiEnvelope<ReportCardTemplateDto>

    @PATCH("report-card-templates/{id}")
    suspend fun update(@Path("id") id: String, @Body body: ReportCardTemplateDto): ApiEnvelope<ReportCardTemplateDto>

    @DELETE("report-card-templates/{id}")
    suspend fun delete(@Path("id") id: String)

    @POST("report-card-templates/{id}/set-default")
    suspend fun setDefault(@Path("id") id: String, @Body body: JsonObject = JsonObject(emptyMap())): ApiEnvelope<ReportCardTemplateDto>
}

@Module
@InstallIn(SingletonComponent::class)
object ReportCardTemplatesNetworkModule {
    @Provides
    @Singleton
    fun provideReportCardTemplatesApi(retrofit: Retrofit): ReportCardTemplatesApi = retrofit.create(ReportCardTemplatesApi::class.java)
}
