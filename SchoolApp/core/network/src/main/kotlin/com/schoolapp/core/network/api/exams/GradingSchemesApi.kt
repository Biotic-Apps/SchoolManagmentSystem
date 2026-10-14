package com.schoolapp.core.network.api.exams

import com.schoolapp.core.network.dto.exams.grading.GradingSchemeCreateBodyDto
import com.schoolapp.core.network.dto.exams.grading.GradingSchemeDto
import com.schoolapp.core.network.dto.exams.grading.GradingSchemeUpdateBodyDto
import com.schoolapp.core.network.model.ApiEnvelope
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import kotlinx.serialization.json.JsonObject
import retrofit2.Retrofit
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.PATCH
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query
import javax.inject.Singleton

/** Grading schemes (`exams.view` to list, `exams.add` / `exams.edit` to save, `exams.approve` to approve). */
interface GradingSchemesApi {
    @GET("grading-schemes")
    suspend fun schemes(
        @Query("schoolId") schoolId: String? = null,
        @Query("sessionId") sessionId: String? = null,
    ): ApiEnvelope<List<GradingSchemeDto>>

    @POST("grading-schemes")
    suspend fun create(@Body body: GradingSchemeCreateBodyDto): ApiEnvelope<GradingSchemeDto>

    /** 409 once an exam using the scheme has approved results. */
    @PATCH("grading-schemes/{id}")
    suspend fun update(@Path("id") id: String, @Body body: GradingSchemeUpdateBodyDto): ApiEnvelope<GradingSchemeDto>

    @POST("grading-schemes/{id}/approve")
    suspend fun approve(@Path("id") id: String, @Body body: JsonObject = JsonObject(emptyMap())): ApiEnvelope<GradingSchemeDto>
}

@Module
@InstallIn(SingletonComponent::class)
object GradingSchemesNetworkModule {
    @Provides
    @Singleton
    fun provideGradingSchemesApi(retrofit: Retrofit): GradingSchemesApi = retrofit.create(GradingSchemesApi::class.java)
}
