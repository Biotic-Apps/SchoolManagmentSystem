package com.schoolapp.feature.fees

import com.schoolapp.feature.fees.proof.ProofDraft
import com.schoolapp.feature.fees.proof.ProofIssue
import com.schoolapp.feature.fees.proof.ProofValidator
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test
import java.time.LocalDate

class ProofValidatorTest {

    private val today = LocalDate.of(2026, 10, 6)
    private val balance = 850_000L
    private val valid = ProofDraft(amountText = "8,500", paidOn = "2026-10-05", reference = "TRX-123", fileMime = "image/jpeg", hasFile = true)

    private fun issues(draft: ProofDraft) = ProofValidator.validate(draft, balance, today)

    @Test
    fun complete_draft_has_no_issues() {
        assertEquals(emptySet<ProofIssue>(), issues(valid))
        assertEquals(emptySet<ProofIssue>(), issues(valid.copy(amountText = "8500", fileMime = "application/pdf", paidOn = "2026-10-06")))
    }

    @Test
    fun amount_is_required_positive_parseable_and_not_above_balance() {
        assertEquals(setOf(ProofIssue.AMOUNT_REQUIRED), issues(valid.copy(amountText = " ")))
        assertEquals(setOf(ProofIssue.AMOUNT_INVALID), issues(valid.copy(amountText = "12.345")))
        assertEquals(setOf(ProofIssue.AMOUNT_INVALID), issues(valid.copy(amountText = "abc")))
        assertEquals(setOf(ProofIssue.AMOUNT_NOT_POSITIVE), issues(valid.copy(amountText = "0")))
        assertEquals(setOf(ProofIssue.AMOUNT_OVER_BALANCE), issues(valid.copy(amountText = "8,500.01")))
        assertTrue(issues(valid.copy(amountText = "100")).isEmpty())
    }

    @Test
    fun reference_is_required() {
        assertEquals(setOf(ProofIssue.REFERENCE_REQUIRED), issues(valid.copy(reference = "   ")))
    }

    @Test
    fun file_is_required_and_must_be_image_or_pdf() {
        assertEquals(setOf(ProofIssue.FILE_REQUIRED), issues(valid.copy(hasFile = false, fileMime = null)))
        assertEquals(setOf(ProofIssue.FILE_TYPE), issues(valid.copy(fileMime = "application/msword")))
        assertEquals(setOf(ProofIssue.FILE_TYPE), issues(valid.copy(fileMime = null)))
        assertTrue(ProofValidator.isAllowedMime("image/png"))
        assertTrue(ProofValidator.isAllowedMime("APPLICATION/PDF"))
        assertFalse(ProofValidator.isAllowedMime("video/mp4"))
    }

    @Test
    fun paid_on_is_required_and_not_in_future() {
        assertEquals(setOf(ProofIssue.DATE_REQUIRED), issues(valid.copy(paidOn = null)))
        assertEquals(setOf(ProofIssue.DATE_REQUIRED), issues(valid.copy(paidOn = "yesterday")))
        assertEquals(setOf(ProofIssue.DATE_IN_FUTURE), issues(valid.copy(paidOn = "2026-10-07")))
    }

    @Test
    fun all_problems_are_reported_together() {
        val empty = ProofDraft(amountText = "", paidOn = "", reference = "", fileMime = null, hasFile = false)
        assertEquals(
            setOf(ProofIssue.AMOUNT_REQUIRED, ProofIssue.DATE_REQUIRED, ProofIssue.REFERENCE_REQUIRED, ProofIssue.FILE_REQUIRED),
            issues(empty),
        )
    }
}
