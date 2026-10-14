package com.schoolapp.core.data.exams.skillsetup

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.common.enumOrDefault
import com.schoolapp.core.model.exams.SkillDomain
import com.schoolapp.core.model.exams.SkillItem
import com.schoolapp.core.model.exams.SkillLevel
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.exams.SkillConfigApi
import com.schoolapp.core.network.api.exams.SkillConfigBodyDto
import com.schoolapp.core.network.api.exams.SkillConfigDto
import com.schoolapp.core.network.api.exams.SkillConfigItemDto
import com.schoolapp.core.network.api.exams.SkillConfigLevelDto
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Inject
import javax.inject.Singleton

/** A branch's behaviour & skills setup: items per domain (in order) and the rating scale, highest first. */
data class SkillConfig(val items: List<SkillItem>, val scale: List<SkillLevel>)

interface SkillConfigRepository {
    suspend fun config(branchId: String): AppResult<SkillConfig>

    /** [items] with a blank id are new; [scale] is highest first (values are renumbered from the order). */
    suspend fun save(branchId: String, items: List<SkillItem>, scale: List<SkillLevel>): AppResult<SkillConfig>
}

@Singleton
class DefaultSkillConfigRepository @Inject constructor(
    private val api: SkillConfigApi,
    private val apiCaller: ApiCaller,
) : SkillConfigRepository {
    override suspend fun config(branchId: String): AppResult<SkillConfig> = apiCaller.call { api.config(branchId).data.toModel() }

    override suspend fun save(branchId: String, items: List<SkillItem>, scale: List<SkillLevel>): AppResult<SkillConfig> = apiCaller.call {
        val body = SkillConfigBodyDto(
            items = items.map { SkillConfigItemDto(id = it.id.ifBlank { null }, domain = it.domain.name, name = it.name.trim()) },
            scale = scale.mapIndexed { index, level -> SkillConfigLevelDto(scale.size - index, level.code.trim(), level.label.trim()) },
        )
        api.save(branchId, body).data.toModel()
    }

    private fun SkillConfigDto.toModel() = SkillConfig(
        items = items.sortedWith(compareBy({ it.domain }, { it.sortOrder ?: Int.MAX_VALUE }))
            .map { SkillItem(it.id.orEmpty(), enumOrDefault(it.domain, SkillDomain.AFFECTIVE), it.name) },
        scale = scale.sortedByDescending { it.value }.map { SkillLevel(it.value, it.code, it.label) },
    )
}

@Module
@InstallIn(SingletonComponent::class)
interface SkillConfigDataModule {
    @Binds
    fun bindSkillConfigRepository(impl: DefaultSkillConfigRepository): SkillConfigRepository
}
