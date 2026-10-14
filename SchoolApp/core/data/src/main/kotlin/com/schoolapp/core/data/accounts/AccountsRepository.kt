package com.schoolapp.core.data.accounts

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.accounts.Income
import com.schoolapp.core.model.accounts.IncomeCategory
import com.schoolapp.core.model.accounts.IncomeFilter
import com.schoolapp.core.model.accounts.IncomeInput
import com.schoolapp.core.model.accounts.IncomePage
import com.schoolapp.core.model.accounts.ProfitLoss

/** Accounts menu: other income, income categories and profit & loss of a branch. */
interface AccountsRepository {
    /** Categories of [schoolId] (the caller's school when null), sorted by name. */
    suspend fun incomeCategories(schoolId: String?): AppResult<List<IncomeCategory>>

    suspend fun createIncomeCategory(schoolId: String?, name: String, code: String?): AppResult<IncomeCategory>

    /** Newest received first; [page] starts at 1. */
    suspend fun income(branchId: String, filter: IncomeFilter, page: Int, pageSize: Int = PAGE_SIZE): AppResult<IncomePage>

    suspend fun createIncome(branchId: String, input: IncomeInput): AppResult<Income>

    suspend fun updateIncome(id: String, input: IncomeInput): AppResult<Income>

    suspend fun deleteIncome(id: String): AppResult<Unit>

    /** [from] / [to] are inclusive `YYYY-MM-DD`. */
    suspend fun profitLoss(branchId: String, from: String, to: String): AppResult<ProfitLoss>

    companion object {
        const val PAGE_SIZE = 20
    }
}
