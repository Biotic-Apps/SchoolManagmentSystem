package com.schoolapp.feature.approvals.detail.components

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.KeyValueRow
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.feature.approvals.R

/**
 * Payload summary for typed requests (SYLLABUS_PLAN, CHILD_LINK, LEAVE, ..., PAYROLL, EXPENSE, CERTIFICATE):
 * the server payload flattened to label/value rows, known keys first, `…Minor` amounts as money.
 */
@Composable
internal fun RequestDetailsCard(type: String, details: List<Pair<String, String>>, modifier: Modifier = Modifier) {
    if (details.isEmpty()) return
    val preferred = PreferredKeys[type].orEmpty()
    val ordered = details.sortedBy { (key, _) -> preferred.indexOf(key).let { if (it < 0) Int.MAX_VALUE else it } }
    AppCard(modifier.fillMaxWidth()) {
        SectionHeader(title = stringResource(titleFor(type)))
        ordered.forEach { (key, value) -> KeyValueRow(detailLabel(key), detailValue(key, value)) }
    }
}

private fun titleFor(type: String): Int = when (type) {
    "SYLLABUS_PLAN" -> R.string.approvals_details_syllabus
    "CHILD_LINK" -> R.string.approvals_details_child_link
    "CONTACT_CHANGE" -> R.string.approvals_details_contact
    "PROBATION_REVIEW" -> R.string.approvals_details_probation
    "LEAVE" -> R.string.approvals_details_leave
    "ATTENDANCE_CORRECTION" -> R.string.approvals_details_attendance_correction
    "DIARY_MODERATION" -> R.string.approvals_details_diary
    "ACTIVITY" -> R.string.approvals_details_activity
    "NOTICE" -> R.string.approvals_details_notice
    "RESULT_PUBLISH" -> R.string.approvals_details_result_publish
    "PROMOTION" -> R.string.approvals_details_promotion
    "CONCESSION" -> R.string.approvals_details_concession
    "REFUND" -> R.string.approvals_details_refund
    "PAYMENT_REVERSAL" -> R.string.approvals_details_payment_reversal
    "PAYROLL" -> R.string.approvals_details_payroll
    "EXPENSE" -> R.string.approvals_details_expense
    "PURCHASE_ORDER" -> R.string.approvals_details_purchase_order
    "CERTIFICATE" -> R.string.approvals_details_certificate
    else -> R.string.approvals_details
}

private val PreferredKeys: Map<String, List<String>> = mapOf(
    "SYLLABUS_PLAN" to listOf("className", "sectionName", "subjectName", "revision", "chapters", "topics"),
    "CHILD_LINK" to listOf("student.name", "student.admissionNo", "student.className", "relation", "guardian.name", "guardian.phone"),
    "CONTACT_CHANGE" to listOf("phone", "email", "address", "old.phone", "old.email", "old.address"),
    "PROBATION_REVIEW" to listOf("action", "topicTitle", "status", "completedOn", "note"),
    "LEAVE" to listOf("subject.name", "from", "to", "days", "type", "reason"),
    "ATTENDANCE_CORRECTION" to listOf("student", "student.name", "date", "oldStatus", "newStatus", "reason"),
    "DIARY_MODERATION" to listOf("className", "sectionName", "subject", "subjectName", "date", "topics", "homework"),
    "ACTIVITY" to listOf("title", "type", "startAt", "venue", "consentRequired"),
    "NOTICE" to listOf("title", "audience"),
    "RESULT_PUBLISH" to listOf("examName", "className", "sheetsAccepted", "sheetsTotal"),
    "PROMOTION" to listOf("fromSession", "toSession", "className", "promoteCount", "repeatCount"),
    "CONCESSION" to listOf("studentName", "className", "type", "value", "amountMinor", "reason"),
    "REFUND" to listOf("studentName", "receiptNo", "amountMinor", "method", "reason"),
    "PAYMENT_REVERSAL" to listOf("receiptNo", "studentName", "amountMinor", "reason"),
    "PAYROLL" to listOf("month", "staffCount", "netMinor"),
    "EXPENSE" to listOf("title", "category", "vendor", "amountMinor", "billDate", "dueDate"),
    "PURCHASE_ORDER" to listOf("lines", "totalMinor", "reason"),
    "CERTIFICATE" to listOf("studentName", "className", "type", "purpose"),
)
