package com.schoolapp.feature.fees.proof

import com.schoolapp.core.designsystem.money.MoneyFormat
import java.time.LocalDate
import java.time.format.DateTimeParseException

enum class ProofIssue {
    AMOUNT_REQUIRED,
    AMOUNT_INVALID,
    AMOUNT_NOT_POSITIVE,
    AMOUNT_OVER_BALANCE,
    DATE_REQUIRED,
    DATE_IN_FUTURE,
    REFERENCE_REQUIRED,
    FILE_REQUIRED,
    FILE_TYPE,
}

/** What the parent entered on the proof form, before upload. */
data class ProofDraft(
    val amountText: String,
    val paidOn: String?,
    val reference: String,
    val fileMime: String?,
    val hasFile: Boolean,
)

/** Pure rules for a payment proof: positive amount up to the balance, past date, reference and an image/PDF file. */
object ProofValidator {
    fun validate(draft: ProofDraft, balanceMinor: Long, today: LocalDate): Set<ProofIssue> = buildSet {
        val amount = MoneyFormat.parse(draft.amountText)
        when {
            draft.amountText.isBlank() -> add(ProofIssue.AMOUNT_REQUIRED)
            amount == null -> add(ProofIssue.AMOUNT_INVALID)
            amount <= 0L -> add(ProofIssue.AMOUNT_NOT_POSITIVE)
            amount > balanceMinor -> add(ProofIssue.AMOUNT_OVER_BALANCE)
        }
        val date = draft.paidOn?.let(::parseDate)
        when {
            draft.paidOn.isNullOrBlank() || date == null -> add(ProofIssue.DATE_REQUIRED)
            date.isAfter(today) -> add(ProofIssue.DATE_IN_FUTURE)
        }
        if (draft.reference.isBlank()) add(ProofIssue.REFERENCE_REQUIRED)
        when {
            !draft.hasFile -> add(ProofIssue.FILE_REQUIRED)
            !isAllowedMime(draft.fileMime) -> add(ProofIssue.FILE_TYPE)
        }
    }

    fun isAllowedMime(mime: String?): Boolean {
        val value = mime?.lowercase()?.trim() ?: return false
        return value.startsWith("image/") || value == PDF
    }

    private fun parseDate(raw: String): LocalDate? = try {
        LocalDate.parse(raw.take(DATE_LENGTH))
    } catch (e: DateTimeParseException) {
        null
    }

    const val PDF = "application/pdf"
    private const val DATE_LENGTH = 10
}
