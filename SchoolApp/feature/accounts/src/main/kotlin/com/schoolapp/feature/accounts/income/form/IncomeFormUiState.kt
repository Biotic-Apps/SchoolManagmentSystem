package com.schoolapp.feature.accounts.income.form

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.accounts.Income
import com.schoolapp.core.model.files.AttachmentDraft
import com.schoolapp.feature.accounts.income.IncomeChange

enum class IncomeField { TITLE, CATEGORY, AMOUNT, DATE, DESCRIPTION, NOTES }

enum class IncomeProblem { REQUIRED, TOO_SHORT, TOO_LONG, INVALID }

/** Record / edit income form; [amount] is the typed major-unit text, [receivedOn] `YYYY-MM-DD`. */
data class IncomeFormUiState(
    val isOpen: Boolean = false,
    val branchId: String? = null,
    val editing: Income? = null,
    val title: String = "",
    val categoryId: String? = null,
    val amount: String = "",
    val receivedOn: String = "",
    val description: String = "",
    val notes: String = "",
    /** New receipt picked in this form (max one file). */
    val receipt: AttachmentDraft = AttachmentDraft(),
    val errors: Map<IncomeField, IncomeProblem> = emptyMap(),
    val isSaving: Boolean = false,
    val error: AppError? = null,
    val saved: Income? = null,
) {
    val isEdit: Boolean get() = editing != null

    /** Receipt already stored on the record being edited (replaced when a new one is picked). */
    val currentReceiptUrl: String? get() = editing?.receiptUrl?.takeIf { receipt.items.isEmpty() }
}
