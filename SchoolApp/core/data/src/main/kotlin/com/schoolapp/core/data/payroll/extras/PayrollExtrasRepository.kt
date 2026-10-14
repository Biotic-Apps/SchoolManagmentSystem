package com.schoolapp.core.data.payroll.extras

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.payroll.extras.AdjustmentInput
import com.schoolapp.core.model.payroll.extras.AdjustmentKind
import com.schoolapp.core.model.payroll.extras.AdjustmentStatus
import com.schoolapp.core.model.payroll.extras.OvertimeEntry
import com.schoolapp.core.model.payroll.extras.OvertimeInput
import com.schoolapp.core.model.payroll.extras.OvertimeMonth
import com.schoolapp.core.model.payroll.extras.OvertimeSource
import com.schoolapp.core.model.payroll.extras.OvertimeStatus
import com.schoolapp.core.model.payroll.extras.PayrollAdjustment
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.payroll.extras.PayrollExtrasApi
import com.schoolapp.core.network.dto.payroll.extras.AdjustmentBodyDto
import com.schoolapp.core.network.dto.payroll.extras.AdjustmentDto
import com.schoolapp.core.network.dto.payroll.extras.CancelBodyDto
import com.schoolapp.core.network.dto.payroll.extras.DecideOvertimeBodyDto
import com.schoolapp.core.network.dto.payroll.extras.OvertimeBodyDto
import com.schoolapp.core.network.dto.payroll.extras.OvertimeListDto
import com.schoolapp.core.network.dto.payroll.extras.OvertimeMonthBodyDto
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Inject
import javax.inject.Singleton

/** Overtime and adjustments of a branch payroll month (`YYYY-MM`). */
interface PayrollExtrasRepository {
    suspend fun overtime(branchId: String, month: String): AppResult<OvertimeMonth>

    suspend fun addOvertime(input: OvertimeInput): AppResult<Unit>

    /** Returns how many new entries attendance produced. */
    suspend fun scanOvertime(branchId: String, month: String): AppResult<Int>

    suspend fun decideOvertime(ids: List<String>, approve: Boolean): AppResult<Unit>

    suspend fun removeOvertime(id: String): AppResult<Unit>

    suspend fun adjustments(branchId: String, month: String, staffId: String?): AppResult<List<PayrollAdjustment>>

    suspend fun addAdjustment(input: AdjustmentInput): AppResult<Unit>

    suspend fun cancelAdjustment(id: String, reason: String): AppResult<Unit>
}

@Singleton
class DefaultPayrollExtrasRepository @Inject constructor(
    private val api: PayrollExtrasApi,
    private val apiCaller: ApiCaller,
) : PayrollExtrasRepository {

    override suspend fun overtime(branchId: String, month: String) = apiCaller.call { api.overtime(branchId, month).data.toModel() }

    override suspend fun addOvertime(input: OvertimeInput) = apiCaller.call {
        api.addOvertime(OvertimeBodyDto(input.staffId, input.date, input.minutes, input.reason.trim()))
        Unit
    }

    override suspend fun scanOvertime(branchId: String, month: String) =
        apiCaller.call { api.scanOvertime(OvertimeMonthBodyDto(branchId, month)).data.created }

    override suspend fun decideOvertime(ids: List<String>, approve: Boolean) = apiCaller.call {
        api.decideOvertime(DecideOvertimeBodyDto(ids, if (approve) "APPROVED" else "REJECTED"))
        Unit
    }

    override suspend fun removeOvertime(id: String) = apiCaller.call {
        api.removeOvertime(id)
        Unit
    }

    override suspend fun adjustments(branchId: String, month: String, staffId: String?) =
        apiCaller.call { api.adjustments(branchId, month, staffId).data.mapNotNull { it.toModel() } }

    override suspend fun addAdjustment(input: AdjustmentInput) = apiCaller.call {
        api.addAdjustment(AdjustmentBodyDto(input.staffId, input.month, input.kind.name, input.amountMinor, input.reason.trim()))
        Unit
    }

    override suspend fun cancelAdjustment(id: String, reason: String) = apiCaller.call {
        api.cancelAdjustment(id, CancelBodyDto(reason.trim()))
        Unit
    }
}

private fun OvertimeListDto.toModel() = OvertimeMonth(
    items = items.map { dto ->
        OvertimeEntry(
            id = dto.id,
            staffId = dto.staff?.id.orEmpty(),
            staffName = dto.staff?.name.orEmpty(),
            designation = dto.designation,
            date = dto.date.take(10),
            minutes = dto.minutes,
            source = if (dto.source.equals("ATTENDANCE", true)) OvertimeSource.ATTENDANCE else OvertimeSource.MANUAL,
            status = OvertimeStatus.entries.firstOrNull { it.name == dto.status?.uppercase() } ?: OvertimeStatus.PENDING,
            reason = dto.reason,
            checkOut = dto.checkOut,
            decidedBy = dto.decidedBy?.name,
        )
    },
    pendingCount = pendingCount,
    approvedMinutes = approvedMinutes,
    staffLeavesAt = staffLeavesAt,
    overtimeEnabled = overtimeEnabled,
    locked = locked,
)

private fun AdjustmentDto.toModel(): PayrollAdjustment? {
    val kind = AdjustmentKind.entries.firstOrNull { it.name == kind.uppercase() } ?: return null
    return PayrollAdjustment(
        id = id,
        staffId = staffId,
        staffName = staff?.name.orEmpty(),
        month = month,
        kind = kind,
        amountMinor = amountMinor,
        reason = reason.orEmpty(),
        status = AdjustmentStatus.entries.firstOrNull { it.name == status?.uppercase() } ?: AdjustmentStatus.PENDING,
        cancelReason = cancelReason,
    )
}

@Module
@InstallIn(SingletonComponent::class)
interface PayrollExtrasDataModule {
    @Binds
    fun bindPayrollExtrasRepository(impl: DefaultPayrollExtrasRepository): PayrollExtrasRepository
}
