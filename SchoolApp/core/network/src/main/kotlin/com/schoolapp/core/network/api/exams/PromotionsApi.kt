package com.schoolapp.core.network.api.exams

import com.schoolapp.core.network.dto.common.IdNameDto
import com.schoolapp.core.network.dto.exams.admin.JobIdDto
import com.schoolapp.core.network.model.ApiEnvelope
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import kotlinx.serialization.Serializable
import retrofit2.Retrofit
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.PATCH
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query
import javax.inject.Singleton

@Serializable
data class PromotionRowDto(
    val id: String,
    val student: IdNameDto? = null,
    val fromClass: IdNameDto? = null,
    val fromSection: IdNameDto? = null,
    val toClass: IdNameDto? = null,
    val toSection: IdNameDto? = null,
    val percent: Double? = null,
    val failedSubjects: Int = 0,
    val suggested: String? = null,
    val decision: String? = null,
    val status: String? = null,
    val reason: String? = null,
    val overridden: Boolean = false,
)

@Serializable
data class SuggestPromotionsBodyDto(val branchId: String, val fromSessionId: String, val toSessionId: String, val examIds: List<String>)

@Serializable
data class OverridePromotionBodyDto(val decision: String, val toSectionId: String? = null, val reason: String? = null)

@Serializable
data class ConfirmPromotionsBodyDto(val branchId: String, val fromSessionId: String, val classId: String? = null)

@Serializable
data class ApplyPromotionsBodyDto(val branchId: String, val fromSessionId: String, val effectiveDate: String)

@Serializable
data class ConfirmPromotionsResultDto(val approvalId: String? = null, val count: Int = 0)

@Serializable
data class SkippedPromotionDto(val id: String? = null, val reason: String? = null)

@Serializable
data class ApplyPromotionsResultDto(val applied: Int = 0, val skipped: List<SkippedPromotionDto> = emptyList())

/** End-of-session promotions (`exams.view` to list, `exams.approve` for everything else). */
interface PromotionsApi {
    @GET("promotions")
    suspend fun promotions(
        @Query("branchId") branchId: String,
        @Query("fromSessionId") fromSessionId: String,
        @Query("classId") classId: String? = null,
    ): ApiEnvelope<List<PromotionRowDto>>

    @POST("promotions/suggest")
    suspend fun suggest(@Body body: SuggestPromotionsBodyDto): ApiEnvelope<JobIdDto>

    @PATCH("promotions/{id}")
    suspend fun override(@Path("id") id: String, @Body body: OverridePromotionBodyDto): ApiEnvelope<PromotionRowDto>

    @POST("promotions/confirm")
    suspend fun confirm(@Body body: ConfirmPromotionsBodyDto): ApiEnvelope<ConfirmPromotionsResultDto>

    @POST("promotions/apply")
    suspend fun apply(@Body body: ApplyPromotionsBodyDto): ApiEnvelope<ApplyPromotionsResultDto>
}

@Module
@InstallIn(SingletonComponent::class)
object PromotionsNetworkModule {
    @Provides
    @Singleton
    fun providePromotionsApi(retrofit: Retrofit): PromotionsApi = retrofit.create(PromotionsApi::class.java)
}
