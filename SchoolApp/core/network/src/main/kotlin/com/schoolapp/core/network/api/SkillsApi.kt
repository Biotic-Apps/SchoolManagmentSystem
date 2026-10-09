package com.schoolapp.core.network.api

import com.schoolapp.core.network.dto.exams.SaveSkillRatingsBodyDto
import com.schoolapp.core.network.dto.exams.SkillGridDto
import com.schoolapp.core.network.model.ApiEnvelope
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.PUT
import retrofit2.http.Path
import retrofit2.http.Query

/** Behaviour & skills ratings of a section for an exam (phase 4 contract A2b). */
interface SkillsApi {
    @GET("exams/{id}/skills")
    suspend fun grid(@Path("id") examId: String, @Query("sectionId") sectionId: String): ApiEnvelope<SkillGridDto>

    @PUT("exams/{id}/skills")
    suspend fun save(@Path("id") examId: String, @Body body: SaveSkillRatingsBodyDto): ApiEnvelope<SkillGridDto>
}
