package com.schoolapp.core.data.expenses

import com.schoolapp.core.model.common.enumOrDefault
import com.schoolapp.core.model.common.enumOrNull
import com.schoolapp.core.model.expenses.Expense
import com.schoolapp.core.model.expenses.ExpenseCategory
import com.schoolapp.core.model.expenses.ExpenseCategoryInput
import com.schoolapp.core.model.expenses.ExpenseInput
import com.schoolapp.core.model.expenses.ExpensePayment
import com.schoolapp.core.model.expenses.ExpensePaymentInput
import com.schoolapp.core.model.expenses.ExpensePaymentMethod
import com.schoolapp.core.model.expenses.ExpenseStatus
import com.schoolapp.core.model.expenses.Vendor
import com.schoolapp.core.model.expenses.VendorInput
import com.schoolapp.core.network.dto.expenses.CreateExpenseCategoryDto
import com.schoolapp.core.network.dto.expenses.CreateExpenseDto
import com.schoolapp.core.network.dto.expenses.CreateVendorDto
import com.schoolapp.core.network.dto.expenses.ExpenseCategoryDto
import com.schoolapp.core.network.dto.expenses.ExpenseDto
import com.schoolapp.core.network.dto.expenses.ExpensePaymentDto
import com.schoolapp.core.network.dto.expenses.ExpensePaymentInputDto
import com.schoolapp.core.network.dto.expenses.RecurringInputDto
import com.schoolapp.core.network.dto.expenses.UpdateExpenseDto
import com.schoolapp.core.network.dto.expenses.VendorDto

internal fun ExpenseDto.toModel(): Expense {
    val paid = paidMinor ?: payments.sumOf { it.amountMinor }
    val monthly = recurring?.monthly == true
    return Expense(
        id = id,
        branchId = branchId,
        categoryId = category?.id ?: categoryId,
        categoryName = category?.name?.takeIf { it.isNotBlank() },
        vendorId = vendor?.id ?: vendorId,
        vendorName = vendor?.name,
        title = title,
        amountMinor = amountMinor,
        paidMinor = paid,
        balanceMinor = balanceMinor ?: (amountMinor - paid).coerceAtLeast(0),
        currency = currency,
        billDate = billDate,
        dueDate = dueDate,
        billFileId = billFileId,
        billUrl = billUrl,
        recurringMonthly = monthly,
        recurringUntil = if (monthly) recurring?.untilMonth else null,
        isRecurringCopy = recurringParentId != null,
        notes = notes,
        status = enumOrDefault(status, ExpenseStatus.UNKNOWN),
        payments = payments.map { it.toModel() },
        createdAt = createdAt,
    )
}

private fun ExpensePaymentDto.toModel() = ExpensePayment(
    id = id,
    amountMinor = amountMinor,
    method = enumOrNull<ExpensePaymentMethod>(method),
    reference = reference,
    paidOn = paidOn,
)

internal fun ExpenseCategoryDto.toModel() = ExpenseCategory(id = id, name = name, code = code)

internal fun VendorDto.toModel() = Vendor(
    id = id,
    name = name,
    contactPerson = contactPerson,
    phone = phone,
    email = email,
    address = address,
    ntn = ntn,
)

private fun ExpenseInput.recurringDto(): RecurringInputDto? =
    if (recurringMonthly) RecurringInputDto(monthly = true, untilMonth = recurringUntil) else null

internal fun ExpenseInput.toCreateDto() = CreateExpenseDto(
    branchId = branchId,
    categoryId = categoryId,
    vendorId = vendorId,
    title = title,
    amountMinor = amountMinor,
    billDate = billDate,
    dueDate = dueDate,
    billFileId = billFileId,
    recurring = recurringDto(),
    notes = notes,
)

internal fun ExpenseInput.toUpdateDto() = UpdateExpenseDto(
    categoryId = categoryId,
    vendorId = vendorId,
    title = title,
    amountMinor = amountMinor,
    billDate = billDate,
    dueDate = dueDate,
    billFileId = billFileId,
    recurring = recurringDto(),
    notes = notes,
)

internal fun ExpensePaymentInput.toDto() = ExpensePaymentInputDto(
    amountMinor = amountMinor,
    method = method.name,
    reference = reference,
    paidOn = paidOn,
)

internal fun VendorInput.toDto(schoolId: String?) = CreateVendorDto(
    schoolId = schoolId,
    name = name,
    contactPerson = contactPerson,
    phone = phone,
    email = email,
    address = address,
    ntn = ntn,
)

internal fun ExpenseCategoryInput.toDto(schoolId: String?) =
    CreateExpenseCategoryDto(schoolId = schoolId, name = name, code = code)
