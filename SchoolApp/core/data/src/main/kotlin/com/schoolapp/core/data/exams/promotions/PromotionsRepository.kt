package com.schoolapp.core.data.exams.promotions

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.common.clean
import com.schoolapp.core.data.common.toRef
import com.schoolapp.core.data.exams.admin.JobFileWaiter
import com.schoolapp.core.model.common.PersonRef
import com.schoolapp.core.model.common.enumOrDefault
import com.schoolapp.core.model.exams.promotions.PromotionApplyResult
import com.schoolapp.core.model.exams.promotions.PromotionDecision
import com.schoolapp.core.model.exams.promotions.PromotionRow
import com.schoolapp.core.model.exams.promotions.PromotionStatus
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.exams.ApplyPromotionsBodyDto
import com.schoolapp.core.network.api.exams.ConfirmPromotionsBodyDto
import com.schoolapp.core.network.api.exams.OverridePromotionBodyDto
import com.schoolapp.core.network.api.exams.PromotionRowDto
import com.schoolapp.core.network.api.exams.PromotionsApi
import com.schoolapp.core.network.api.exams.SuggestPromotionsBodyDto
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Inject
import javax.inject.Singleton

interface PromotionsRepository {
    suspend fun promotions(branchId: String, fromSessionId: String, classId: String? = null): AppResult<List<PromotionRow>>

    /** Starts suggesting from published exams and waits for the job (about a minute at most). */
    suspend fun suggestAndWait(branchId: String, fromSessionId: String, toSessionId: String, examIds: List<String>): AppResult<Unit>

    suspend fun override(id: String, decision: PromotionDecision, toSectionId: String?, reason: String?): AppResult<PromotionRow>

    /** Locks the decisions and sends them for approval; returns how many were confirmed. */
    suspend fun confirm(branchId: String, fromSessionId: String, classId: String?): AppResult<Int>

    suspend fun apply(branchId: String, fromSessionId: String, effectiveDate: String): AppResult<PromotionApplyResult>
}

@Singleton
class DefaultPromotionsRepository @Inject constructor(
    private val api: PromotionsApi,
    private val apiCaller: ApiCaller,
    private val jobs: JobFileWaiter,
) : PromotionsRepository {
    override suspend fun promotions(branchId: String, fromSessionId: String, classId: String?): AppResult<List<PromotionRow>> =
        apiCaller.call {
            api.promotions(branchId, fromSessionId, classId).data.map { it.toModel() }
                .sortedWith(compareBy({ it.fromClass?.name.orEmpty() }, { it.fromSection?.name.orEmpty() }, { it.student.name }))
        }

    override suspend fun suggestAndWait(branchId: String, fromSessionId: String, toSessionId: String, examIds: List<String>): AppResult<Unit> {
        val jobId = when (val started = apiCaller.call { api.suggest(SuggestPromotionsBodyDto(branchId, fromSessionId, toSessionId, examIds)).data.jobId }) {
            is AppResult.Failure -> return started
            is AppResult.Success -> started.data
        }
        return if (jobId.isNullOrBlank()) AppResult.Success(Unit) else jobs.awaitDone(jobId)
    }

    override suspend fun override(id: String, decision: PromotionDecision, toSectionId: String?, reason: String?): AppResult<PromotionRow> =
        apiCaller.call { api.override(id, OverridePromotionBodyDto(decision.name, toSectionId, reason.clean())).data.toModel() }

    override suspend fun confirm(branchId: String, fromSessionId: String, classId: String?): AppResult<Int> =
        apiCaller.call { api.confirm(ConfirmPromotionsBodyDto(branchId, fromSessionId, classId)).data.count }

    override suspend fun apply(branchId: String, fromSessionId: String, effectiveDate: String): AppResult<PromotionApplyResult> =
        apiCaller.call { api.apply(ApplyPromotionsBodyDto(branchId, fromSessionId, effectiveDate)).data.let { PromotionApplyResult(it.applied, it.skipped.size) } }

    private fun PromotionRowDto.toModel() = PromotionRow(
        id = id,
        student = student?.toRef() ?: PersonRef(null, ""),
        fromClass = fromClass?.toRef(),
        fromSection = fromSection?.toRef(),
        toClass = toClass?.toRef(),
        toSection = toSection?.toRef(),
        percent = percent,
        failedSubjects = failedSubjects,
        suggested = enumOrDefault(suggested, PromotionDecision.PROMOTE),
        decision = enumOrDefault(decision ?: suggested, PromotionDecision.PROMOTE),
        status = enumOrDefault(status, PromotionStatus.SUGGESTED),
        reason = reason.clean(),
        overridden = overridden,
    )
}

@Module
@InstallIn(SingletonComponent::class)
interface PromotionsDataModule {
    @Binds
    fun bindPromotionsRepository(impl: DefaultPromotionsRepository): PromotionsRepository
}
