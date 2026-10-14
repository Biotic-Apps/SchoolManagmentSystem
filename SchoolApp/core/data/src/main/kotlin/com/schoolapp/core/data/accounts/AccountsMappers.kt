package com.schoolapp.core.data.accounts

import com.schoolapp.core.model.accounts.Income
import com.schoolapp.core.model.accounts.IncomeCategory
import com.schoolapp.core.model.accounts.IncomeInput
import com.schoolapp.core.model.accounts.ProfitLoss
import com.schoolapp.core.model.accounts.ProfitLossLine
import com.schoolapp.core.model.accounts.ProfitLossSection
import com.schoolapp.core.network.dto.accounts.CreateIncomeRequest
import com.schoolapp.core.network.dto.accounts.IncomeCategoryDto
import com.schoolapp.core.network.dto.accounts.IncomeDto
import com.schoolapp.core.network.dto.accounts.ProfitLossDto
import com.schoolapp.core.network.dto.accounts.UpdateIncomeRequest

private const val DEFAULT_CURRENCY = "PKR"

internal fun IncomeCategoryDto.toModel() = IncomeCategory(id = id, name = name, code = code?.takeIf { it.isNotBlank() })

internal fun IncomeDto.toModel() = Income(
    id = id,
    branchId = branchId,
    category = category?.toModel() ?: categoryId?.let { IncomeCategory(it, "", null) },
    title = title,
    description = description?.takeIf { it.isNotBlank() },
    amountMinor = amountMinor,
    currency = currency?.takeIf { it.isNotBlank() } ?: DEFAULT_CURRENCY,
    receivedOn = receivedOn.take(DATE_LENGTH),
    receiptFileId = receiptFileId,
    receiptUrl = receiptUrl,
    notes = notes?.takeIf { it.isNotBlank() },
    createdAt = createdAt,
)

internal fun IncomeInput.toCreateRequest(branchId: String) = CreateIncomeRequest(
    branchId = branchId,
    categoryId = categoryId,
    title = title.trim(),
    description = description.blankToNull(),
    amountMinor = amountMinor,
    receivedOn = receivedOn,
    receiptFileId = receiptFileId,
    notes = notes.blankToNull(),
)

/** Optional text is sent as "" when cleared so the server overwrites the old value. */
internal fun IncomeInput.toUpdateRequest() = UpdateIncomeRequest(
    categoryId = categoryId,
    title = title.trim(),
    description = description?.trim().orEmpty(),
    amountMinor = amountMinor,
    receivedOn = receivedOn,
    receiptFileId = receiptFileId,
    notes = notes?.trim().orEmpty(),
)

internal fun ProfitLossDto.toModel() = ProfitLoss(
    from = from,
    to = to,
    totalIncomeMinor = totalIncomeMinor,
    totalExpensesMinor = totalExpensesMinor,
    netMinor = netMinor,
    lines = lines.map {
        ProfitLossLine(
            section = if (it.section.equals("INCOME", ignoreCase = true)) ProfitLossSection.INCOME else ProfitLossSection.EXPENSE,
            item = it.item,
            amountMinor = it.amountMinor,
        )
    },
)

private fun String?.blankToNull(): String? = this?.trim()?.takeIf { it.isNotEmpty() }

private const val DATE_LENGTH = 10
