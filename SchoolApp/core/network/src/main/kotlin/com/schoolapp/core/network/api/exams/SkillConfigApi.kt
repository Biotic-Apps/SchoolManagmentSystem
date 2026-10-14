package com.schoolapp.core.network.api.exams

import com.schoolapp.core.network.model.ApiEnvelope
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import kotlinx.serialization.Serializable
import retrofit2.Retrofit
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.PUT
import retrofit2.http.Path
import javax.inject.Singleton

@Serializable
data class SkillConfigItemDto(val id: String? = null, val domain: String = "AFFECTIVE", val name: String = "", val sortOrder: Int? = null)

@Serializable
data class SkillConfigLevelDto(val value: Int = 0, val code: String = "", val label: String = "")

/** `GET/PUT /branches/:id/skills`: the branch's behaviour & skills items and rating scale (highest first). */
@Serializable
data class SkillConfigDto(
    val branchId: String? = null,
    val items: List<SkillConfigItemDto> = emptyList(),
    val scale: List<SkillConfigLevelDto> = emptyList(),
)

@Serializable
data class SkillConfigBodyDto(val items: List<SkillConfigItemDto>, val scale: List<SkillConfigLevelDto>)

interface SkillConfigApi {
    /** Defaults are created on first use (`exams.view`). */
    @GET("branches/{id}/skills")
    suspend fun config(@Path("id") branchId: String): ApiEnvelope<SkillConfigDto>

    /** `exams.edit`; items keep their id when renamed. */
    @PUT("branches/{id}/skills")
    suspend fun save(@Path("id") branchId: String, @Body body: SkillConfigBodyDto): ApiEnvelope<SkillConfigDto>
}

@Module
@InstallIn(SingletonComponent::class)
object SkillConfigNetworkModule {
    @Provides
    @Singleton
    fun provideSkillConfigApi(retrofit: Retrofit): SkillConfigApi = retrofit.create(SkillConfigApi::class.java)
}
