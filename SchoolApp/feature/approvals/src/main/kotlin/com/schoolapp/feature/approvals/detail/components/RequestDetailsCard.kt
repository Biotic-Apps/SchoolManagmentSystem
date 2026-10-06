package com.schoolapp.feature.approvals.detail.components

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.KeyValueRow
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.ui.humanizeKey
import com.schoolapp.feature.approvals.R

/**
 * Payload summary for typed requests (SYLLABUS_PLAN, CHILD_LINK, CONTACT_CHANGE, PROBATION_REVIEW, ...):
 * the server payload flattened to label/value rows, with known keys shown first.
 */
@Composable
internal fun RequestDetailsCard(type: String, details: List<Pair<String, String>>, modifier: Modifier = Modifier) {
    if (details.isEmpty()) return
    val preferred = PreferredKeys[type].orEmpty()
    val ordered = details.sortedBy { (key, _) -> preferred.indexOf(key).let { if (it < 0) Int.MAX_VALUE else it } }
    AppCard(modifier.fillMaxWidth()) {
        SectionHeader(title = stringResource(titleFor(type)))
        ordered.forEach { (key, value) -> KeyValueRow(humanizeKey(key.substringAfterLast('.')), value.toDisplay()) }
    }
}

private fun String.toDisplay(): String = if (this == this.uppercase() && contains('_')) humanizeKey(this) else this

private fun titleFor(type: String): Int = when (type) {
    "SYLLABUS_PLAN" -> R.string.approvals_details_syllabus
    "CHILD_LINK" -> R.string.approvals_details_child_link
    "CONTACT_CHANGE" -> R.string.approvals_details_contact
    "PROBATION_REVIEW" -> R.string.approvals_details_probation
    else -> R.string.approvals_details
}

private val PreferredKeys: Map<String, List<String>> = mapOf(
    "SYLLABUS_PLAN" to listOf("className", "sectionName", "subjectName", "revision", "chapters", "topics"),
    "CHILD_LINK" to listOf("student.name", "student.admissionNo", "student.className", "relation", "guardian.name", "guardian.phone"),
    "CONTACT_CHANGE" to listOf("phone", "email", "address", "old.phone", "old.email", "old.address"),
    "PROBATION_REVIEW" to listOf("action", "topicTitle", "status", "completedOn", "note"),
)
