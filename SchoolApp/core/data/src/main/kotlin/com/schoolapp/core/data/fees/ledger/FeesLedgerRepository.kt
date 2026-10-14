package com.schoolapp.core.data.fees.ledger

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.fees.toModel
import com.schoolapp.core.model.fees.Payment
import com.schoolapp.core.model.fees.PaymentMethod
import com.schoolapp.core.model.fees.ledger.Concession
import com.schoolapp.core.model.fees.ledger.ConcessionInput
import com.schoolapp.core.model.fees.ledger.ConcessionType
import com.schoolapp.core.model.fees.ledger.LedgerEntry
import com.schoolapp.core.model.fees.ledger.RequestStatus
import com.schoolapp.core.model.fees.ledger.StudentLedger
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.fees.ledger.ConcessionBodyDto
import com.schoolapp.core.network.api.fees.ledger.ConcessionDto
import com.schoolapp.core.network.api.fees.ledger.FeesLedgerApi
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Inject
import javax.inject.Singleton

/** Filters of the payments list; dates are `YYYY-MM-DD`. */
data class PaymentFilter(val from: String? = null, val to: String? = null, val method: PaymentMethod? = null, val search: String? = null)

interface FeesLedgerRepository {
    suspend fun payments(branchId: String, filter: PaymentFilter): AppResult<List<Payment>>

    suspend fun concessions(branchId: String, status: RequestStatus?): AppResult<List<Concession>>

    suspend fun requestConcession(input: ConcessionInput): AppResult<Unit>

    suspend fun ledger(studentId: String): AppResult<StudentLedger>
}

@Singleton
class DefaultFeesLedgerRepository @Inject constructor(
    private val api: FeesLedgerApi,
    private val apiCaller: ApiCaller,
) : FeesLedgerRepository {

    override suspend fun payments(branchId: String, filter: PaymentFilter) = apiCaller.call {
        api.payments(branchId, filter.from, filter.to, filter.method?.name, filter.search?.trim()?.takeIf { it.isNotEmpty() })
            .data.map { it.toModel() }
    }

    override suspend fun concessions(branchId: String, status: RequestStatus?) =
        apiCaller.call { api.concessions(branchId, status?.name).data.map { it.toModel() } }

    override suspend fun requestConcession(input: ConcessionInput) = apiCaller.call {
        api.requestConcession(
            ConcessionBodyDto(input.studentId, input.feeHeadId, input.type.name, input.value, input.from, input.to, input.reason.trim()),
        )
        Unit
    }

    override suspend fun ledger(studentId: String) = apiCaller.call {
        val dto = api.ledger(studentId).data
        StudentLedger(
            entries = dto.entries.map {
                LedgerEntry(it.id, it.date, it.type, it.description.orEmpty(), it.amountMinor, it.balanceMinor, it.invoiceNo ?: it.receiptNo)
            },
            balanceMinor = dto.balanceMinor,
            currency = dto.currency ?: "PKR",
        )
    }
}

private fun ConcessionDto.toModel() = Concession(
    id = id,
    studentName = student?.name.orEmpty(),
    admissionNo = student?.admissionNo,
    feeHeadName = feeHead?.name,
    type = if (type.equals("FIXED", true)) ConcessionType.FIXED else ConcessionType.PERCENT,
    value = value,
    from = from,
    to = to,
    reason = reason.orEmpty(),
    estimateMinor = estimateMinor,
    status = RequestStatus.entries.firstOrNull { it.name == status?.uppercase() } ?: RequestStatus.PENDING,
)

@Module
@InstallIn(SingletonComponent::class)
interface FeesLedgerDataModule {
    @Binds
    fun bindFeesLedgerRepository(impl: DefaultFeesLedgerRepository): FeesLedgerRepository
}
