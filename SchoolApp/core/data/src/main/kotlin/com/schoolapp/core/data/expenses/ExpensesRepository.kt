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

/** Branch expenses (bills) plus the school-wide vendor and category catalogues. */
interface ExpensesRepository {
    /** Newest bill date first. */
    suspend fun expenses(query: ExpenseQuery, page: Int, pageSize: Int): AppResult<ExpensePage<Expense>>

    suspend fun expense(id: String): AppResult<Expense>

    /** Saved as a DRAFT. */
    suspend fun create(input: ExpenseInput): AppResult<Expense>

    /** DRAFT or REJECTED only; the result is a DRAFT. */
    suspend fun update(id: String, input: ExpenseInput): AppResult<Expense>

    /** Sends the bill for approval. */
    suspend fun submit(id: String): AppResult<Expense>

    suspend fun recordPayment(id: String, input: ExpensePaymentInput): AppResult<Expense>

    /** [schoolId] is required for global admins; scoped users may pass null. */
    suspend fun vendors(schoolId: String?, search: String?, page: Int, pageSize: Int): AppResult<ExpensePage<Vendor>>

    suspend fun createVendor(schoolId: String?, input: VendorInput): AppResult<Vendor>

    suspend fun categories(schoolId: String?): AppResult<List<ExpenseCategory>>

    suspend fun createCategory(schoolId: String?, input: ExpenseCategoryInput): AppResult<ExpenseCategory>
}
