package com.schoolapp.core.data.transfers

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.result.map
import com.schoolapp.core.data.students.list.toPage
import com.schoolapp.core.model.settings.PagedList
import com.schoolapp.core.model.transfers.Transfer
import com.schoolapp.core.model.transfers.TransferFilter
import com.schoolapp.core.model.transfers.TransferStatus
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.transfers.AcceptTransferBodyDto
import com.schoolapp.core.network.transfers.TransferDto
import com.schoolapp.core.network.transfers.TransferReasonBodyDto
import com.schoolapp.core.network.transfers.TransfersApi
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Inject
import javax.inject.Singleton

/** Transfers inbox: list (IN/OUT, status), accept into a section, reject or cancel with a reason. */
interface TransfersRepository {
    suspend fun page(branchId: String?, filter: TransferFilter, page: Int): AppResult<PagedList<Transfer>>
    suspend fun accept(id: String, sectionId: String): AppResult<Unit>
    suspend fun reject(id: String, reason: String): AppResult<Unit>
    suspend fun cancel(id: String, reason: String): AppResult<Unit>
}

@Singleton
internal class DefaultTransfersRepository @Inject constructor(
    private val api: TransfersApi,
    private val apiCaller: ApiCaller,
) : TransfersRepository {
    override suspend fun page(branchId: String?, filter: TransferFilter, page: Int) = apiCaller.call {
        api.transfers(page, branchId, filter.direction?.name, filter.status?.name).toPage(page, TransfersApi.PAGE_SIZE) { it.toModel() }
    }

    override suspend fun accept(id: String, sectionId: String) =
        apiCaller.call { api.accept(id, AcceptTransferBodyDto(sectionId)) }.map { }

    override suspend fun reject(id: String, reason: String) =
        apiCaller.call { api.reject(id, TransferReasonBodyDto(reason.trim())) }.map { }

    override suspend fun cancel(id: String, reason: String) =
        apiCaller.call { api.cancel(id, TransferReasonBodyDto(reason.trim())) }.map { }
}

private fun TransferDto.toModel() = Transfer(
    id = id,
    studentId = student?.id,
    studentName = student?.name.orEmpty(),
    admissionNo = student?.admissionNo,
    fromBranchId = fromBranch?.id,
    fromBranchName = fromBranch?.name,
    toBranchId = toBranch?.id,
    toBranchName = toBranch?.name,
    effectiveDate = effectiveDate,
    reason = reason,
    status = TransferStatus.from(status),
    decisionReason = decisionReason,
    createdAt = createdAt,
)

@Module
@InstallIn(SingletonComponent::class)
internal abstract class TransfersDataModule {
    @Binds
    abstract fun bind(impl: DefaultTransfersRepository): TransfersRepository
}
