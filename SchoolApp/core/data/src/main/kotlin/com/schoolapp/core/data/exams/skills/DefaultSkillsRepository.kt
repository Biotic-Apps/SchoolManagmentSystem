package com.schoolapp.core.data.exams.skills

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.exams.SkillGrid
import com.schoolapp.core.model.exams.SkillRating
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.SkillsApi
import com.schoolapp.core.network.dto.exams.SaveSkillRatingsBodyDto
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DefaultSkillsRepository @Inject constructor(
    private val api: SkillsApi,
    private val apiCaller: ApiCaller,
) : SkillsRepository {
    override suspend fun grid(examId: String, sectionId: String): AppResult<SkillGrid> =
        apiCaller.call { api.grid(examId, sectionId).data.toModel() }

    override suspend fun save(examId: String, sectionId: String, ratings: List<SkillRating>): AppResult<SkillGrid> =
        apiCaller.call { api.save(examId, SaveSkillRatingsBodyDto(sectionId, ratings.map { it.toDto() })).data.toModel() }
}
