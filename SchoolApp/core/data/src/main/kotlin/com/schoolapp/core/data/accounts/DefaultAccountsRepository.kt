package com.schoolapp.core.data.accounts

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.accounts.Income
import com.schoolapp.core.model.accounts.IncomeCategory
import com.schoolapp.core.model.accounts.IncomeFilter
import com.schoolapp.core.model.accounts.IncomeInput
import com.schoolapp.core.model.accounts.IncomePage
import com.schoolapp.core.model.accounts.ProfitLoss
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.accounts.AccountsApi
import com.schoolapp.core.network.dto.accounts.IncomeCategoryRequest
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DefaultAccountsRepository @Inject constructor(
    private val api: AccountsApi,
    private val apiCaller: ApiCaller,
) : AccountsRepository {

    override suspend fun incomeCategories(schoolId: String?): AppResult<List<IncomeCategory>> = apiCaller.call {
        api.incomeCategories(schoolId).data.map { it.toModel() }.sortedBy { it.name.lowercase() }
    }

    override suspend fun createIncomeCategory(schoolId: String?, name: String, code: String?): AppResult<IncomeCategory> =
        apiCaller.call {
            val body = IncomeCategoryRequest(name.trim(), code?.trim()?.uppercase()?.takeIf { it.isNotEmpty() })
            api.createIncomeCategory(schoolId, body).data.toModel()
        }

    override suspend fun income(branchId: String, filter: IncomeFilter, page: Int, pageSize: Int): AppResult<IncomePage> =
        apiCaller.call {
            val response = api.income(branchId, filter.categoryId, filter.from, filter.to, page, pageSize)
            IncomePage(items = response.data.map { it.toModel() }, page = page, total = response.meta?.total)
        }

    override suspend fun createIncome(branchId: String, input: IncomeInput): AppResult<Income> =
        apiCaller.call { api.createIncome(input.toCreateRequest(branchId)).data.toModel() }

    override suspend fun updateIncome(id: String, input: IncomeInput): AppResult<Income> =
        apiCaller.call { api.updateIncome(id, input.toUpdateRequest()).data.toModel() }

    override suspend fun deleteIncome(id: String): AppResult<Unit> = apiCaller.call { api.deleteIncome(id) }

    override suspend fun profitLoss(branchId: String, from: String, to: String): AppResult<ProfitLoss> =
        apiCaller.call { api.profitLoss(branchId, from, to).data.toModel() }
}

@Module
@InstallIn(SingletonComponent::class)
interface AccountsDataModule {
    @Binds
    fun bindAccountsRepository(impl: DefaultAccountsRepository): AccountsRepository
}
