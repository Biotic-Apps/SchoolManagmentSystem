package com.schoolapp.core.data.fees.structure

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.fees.structure.FeeFrequency
import com.schoolapp.core.model.fees.structure.FeeHead
import com.schoolapp.core.model.fees.structure.FeeHeadInput
import com.schoolapp.core.model.fees.structure.FeeHeadKind
import com.schoolapp.core.model.fees.structure.FeePlan
import com.schoolapp.core.model.fees.structure.FeePlanInput
import com.schoolapp.core.model.fees.structure.FeePlanItem
import com.schoolapp.core.model.fees.structure.FeePlanStatus
import com.schoolapp.core.model.fees.structure.LateFee
import com.schoolapp.core.model.fees.structure.SiblingDiscount
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.fees.structure.FeeStructureApi
import com.schoolapp.core.network.dto.fees.structure.ArchiveBodyDto
import com.schoolapp.core.network.dto.fees.structure.FeeHeadBodyDto
import com.schoolapp.core.network.dto.fees.structure.FeeHeadDto
import com.schoolapp.core.network.dto.fees.structure.FeePlanDto
import com.schoolapp.core.network.dto.fees.structure.SiblingDiscountBodyDto
import com.schoolapp.core.network.dto.fees.structure.SiblingDiscountDto
import com.schoolapp.core.network.dto.fees.structure.SiblingPercentBodyDto
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.buildJsonArray
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import kotlinx.serialization.json.putJsonObject
import javax.inject.Inject
import javax.inject.Singleton

/** Fee heads, fee plans and sibling discount rules. */
interface FeeStructureRepository {
    suspend fun feeHeads(schoolId: String?): AppResult<List<FeeHead>>

    suspend fun createFeeHead(input: FeeHeadInput): AppResult<FeeHead>

    suspend fun feePlans(branchId: String, sessionId: String): AppResult<List<FeePlan>>

    /** Creates ([id] null) or edits a plan; an edit of an approved plan becomes a draft again. */
    suspend fun saveFeePlan(id: String?, input: FeePlanInput): AppResult<Unit>

    suspend fun approveFeePlan(id: String): AppResult<Unit>

    suspend fun archiveFeePlan(id: String): AppResult<Unit>

    suspend fun siblingDiscounts(schoolId: String?): AppResult<List<SiblingDiscount>>

    suspend fun addSiblingDiscount(schoolId: String, childIndex: Int, percentOff: Int): AppResult<Unit>

    suspend fun updateSiblingDiscount(id: String, percentOff: Int): AppResult<Unit>

    suspend fun deleteSiblingDiscount(id: String): AppResult<Unit>
}

@Singleton
class DefaultFeeStructureRepository @Inject constructor(
    private val api: FeeStructureApi,
    private val apiCaller: ApiCaller,
) : FeeStructureRepository {

    override suspend fun feeHeads(schoolId: String?) = apiCaller.call { api.feeHeads(schoolId).data.map { it.toModel() } }

    override suspend fun createFeeHead(input: FeeHeadInput) = apiCaller.call {
        api.createFeeHead(FeeHeadBodyDto(input.schoolId, input.code.trim().uppercase(), input.name.trim(), input.kind.name, input.refundable))
            .data.toModel()
    }

    override suspend fun feePlans(branchId: String, sessionId: String) =
        apiCaller.call { api.feePlans(branchId, sessionId).data.map { it.toModel() }.sortedBy { it.className } }

    override suspend fun saveFeePlan(id: String?, input: FeePlanInput) = apiCaller.call {
        val body = input.toJson(includeScope = id == null)
        if (id == null) api.createFeePlan(body) else api.updateFeePlan(id, body)
        Unit
    }

    override suspend fun approveFeePlan(id: String) = apiCaller.call {
        api.approveFeePlan(id)
        Unit
    }

    override suspend fun archiveFeePlan(id: String) = apiCaller.call {
        api.archiveFeePlan(id, ArchiveBodyDto())
        Unit
    }

    override suspend fun siblingDiscounts(schoolId: String?) =
        apiCaller.call { api.siblingDiscounts(schoolId).data.map { it.toModel() }.sortedBy { it.childIndex } }

    override suspend fun addSiblingDiscount(schoolId: String, childIndex: Int, percentOff: Int) = apiCaller.call {
        api.createSiblingDiscount(SiblingDiscountBodyDto(schoolId, childIndex, percentOff))
        Unit
    }

    override suspend fun updateSiblingDiscount(id: String, percentOff: Int) = apiCaller.call {
        api.updateSiblingDiscount(id, SiblingPercentBodyDto(percentOff))
        Unit
    }

    override suspend fun deleteSiblingDiscount(id: String) = apiCaller.call {
        api.deleteSiblingDiscount(id)
        Unit
    }
}

internal fun FeeHeadDto.toModel() = FeeHead(
    id = id,
    code = code,
    name = name,
    kind = if (kind.equals("ONE_TIME", true)) FeeHeadKind.ONE_TIME else FeeHeadKind.RECURRING,
    refundable = refundable,
    system = system,
)

private fun FeePlanDto.toModel() = FeePlan(
    id = id,
    classId = classId,
    className = className.orEmpty(),
    name = name,
    status = FeePlanStatus.entries.firstOrNull { it.name == status?.uppercase() } ?: FeePlanStatus.DRAFT,
    items = items.map { item ->
        FeePlanItem(
            feeHeadId = item.feeHead?.id ?: item.feeHeadId.orEmpty(),
            feeHeadName = item.feeHead?.name.orEmpty(),
            amountMinor = item.amountMinor,
            frequency = FeeFrequency.entries.firstOrNull { it.name == item.frequency.uppercase() } ?: FeeFrequency.MONTHLY,
            dueDay = item.dueDay,
        )
    },
    lateFee = lateFee?.let { LateFee(it.amountMinor, it.afterDays) },
)

private fun SiblingDiscountDto.toModel() = SiblingDiscount(id, childIndex, percentOff)

private fun FeePlanInput.toJson(includeScope: Boolean): JsonObject = buildJsonObject {
    if (includeScope) {
        put("branchId", branchId)
        put("sessionId", sessionId)
        put("classId", classId)
    }
    put("name", name.trim())
    put(
        "items",
        buildJsonArray {
            items.forEach { item ->
                add(
                    buildJsonObject {
                        put("feeHeadId", item.feeHeadId)
                        put("amountMinor", item.amountMinor)
                        put("frequency", item.frequency.name)
                        put("dueDay", item.dueDay)
                    },
                )
            }
        },
    )
    val late = lateFee
    if (late == null) {
        put("lateFee", JsonNull)
    } else {
        putJsonObject("lateFee") {
            put("amountMinor", late.amountMinor)
            put("afterDays", late.afterDays)
        }
    }
}

@Module
@InstallIn(SingletonComponent::class)
interface FeeStructureDataModule {
    @Binds
    fun bindFeeStructureRepository(impl: DefaultFeeStructureRepository): FeeStructureRepository
}
