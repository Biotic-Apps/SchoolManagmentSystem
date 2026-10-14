package com.schoolapp.core.data.expenses

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.expenses.Expense
import com.schoolapp.core.model.expenses.ExpenseCategory
import com.schoolapp.core.model.expenses.ExpenseCategoryInput
import com.schoolapp.core.model.expenses.ExpenseInput
import com.schoolapp.core.model.expenses.ExpensePage
import com.schoolapp.core.model.expenses.ExpensePaymentInput
import com.schoolapp.core.model.expenses.ExpenseQuery
import com.schoolapp.core.model.expenses.Vendor
import com.schoolapp.core.model.expenses.VendorInput
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.expenses.ExpensesApi
import com.schoolapp.core.network.model.ApiEnvelope
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DefaultExpensesRepository @Inject constructor(
    private val api: ExpensesApi,
    private val apiCaller: ApiCaller,
) : ExpensesRepository {

    override suspend fun expenses(query: ExpenseQuery, page: Int, pageSize: Int): AppResult<ExpensePage<Expense>> =
        apiCaller.call {
            api.expenses(
                branchId = query.branchId,
                categoryId = query.categoryId,
                status = query.status?.name,
                from = query.from,
                to = query.to,
                page = page,
                pageSize = pageSize,
            ).toPage(page, pageSize) { it.toModel() }
        }

    override suspend fun expense(id: String): AppResult<Expense> = apiCaller.call { api.expense(id).data.toModel() }

    override suspend fun create(input: ExpenseInput): AppResult<Expense> =
        apiCaller.call { api.create(input.toCreateDto()).data.toModel() }

    override suspend fun update(id: String, input: ExpenseInput): AppResult<Expense> =
        apiCaller.call { api.update(id, input.toUpdateDto()).data.toModel() }

    override suspend fun submit(id: String): AppResult<Expense> = apiCaller.call { api.submit(id).data.toModel() }

    override suspend fun recordPayment(id: String, input: ExpensePaymentInput): AppResult<Expense> =
        apiCaller.call { api.pay(id, input.toDto()).data.toModel() }

    override suspend fun vendors(schoolId: String?, search: String?, page: Int, pageSize: Int): AppResult<ExpensePage<Vendor>> =
        apiCaller.call {
            val term = search?.trim()?.takeIf { it.isNotEmpty() }
            api.vendors(schoolId, term, page, pageSize).toPage(page, pageSize) { it.toModel() }
        }

    override suspend fun createVendor(schoolId: String?, input: VendorInput): AppResult<Vendor> =
        apiCaller.call { api.createVendor(input.toDto(schoolId)).data.toModel() }

    override suspend fun categories(schoolId: String?): AppResult<List<ExpenseCategory>> =
        apiCaller.call { api.categories(schoolId).data.map { it.toModel() }.sortedBy { it.name.lowercase() } }

    override suspend fun createCategory(schoolId: String?, input: ExpenseCategoryInput): AppResult<ExpenseCategory> =
        apiCaller.call { api.createCategory(input.toDto(schoolId)).data.toModel() }

    private inline fun <D, M> ApiEnvelope<List<D>>.toPage(page: Int, pageSize: Int, map: (D) -> M): ExpensePage<M> =
        ExpensePage(
            items = data.map(map),
            total = meta?.total ?: data.size,
            page = meta?.page ?: page,
            pageSize = meta?.pageSize ?: pageSize,
        )
}
