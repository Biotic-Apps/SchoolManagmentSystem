package com.schoolapp.demo

import com.schoolapp.core.model.approval.ApprovalRequest
import com.schoolapp.core.model.approval.ApprovalStatus
import com.schoolapp.core.model.approval.ApprovalStep

/** Phase 2 approval types with payload summaries, for previewing the approvals detail. */
internal object DemoPhase2Approvals {
    private fun pending(id: String, type: String, entity: String, title: String, by: String, at: String, role: String, details: List<Pair<String, String>>) =
        ApprovalRequest(id, type, entity, title, "demo-u-$id", by, ApprovalStatus.PENDING, 1, at, listOf(ApprovalStep(1, role, null, null, null, null)), details)

    val items = listOf(
        pending(
            "demo-ap-11", "SYLLABUS_PLAN", "SyllabusPlan", "Syllabus plan: Class 5-B Science", "Hina Shah", "2026-10-05T06:30:00Z", "PRINCIPAL",
            listOf("className" to "Class 5", "sectionName" to "B", "subjectName" to "Science", "revision" to "1", "chapters" to "6", "topics" to "24"),
        ),
        pending(
            "demo-ap-12", "CHILD_LINK", "ChildLinkRequest", "Link request: Maryam Raza", "Kashif Raza", "2026-10-04T10:20:00Z", "PRINCIPAL",
            listOf(
                "student.name" to "Maryam Raza", "student.admissionNo" to "BS-2026-0020", "student.className" to "Class 5 - B",
                "relation" to "GUARDIAN", "guardian.name" to "Kashif Raza", "guardian.phone" to "0300*****03",
            ),
        ),
        pending(
            "demo-ap-13", "CONTACT_CHANGE", "Guardian", "Contact change: Imran Khan", "Imran Khan", "2026-10-03T14:05:00Z", "PRINCIPAL",
            listOf("phone" to "03019876543", "old.phone" to "03001234500", "address" to "45 Model Town, Lahore"),
        ),
        pending(
            "demo-ap-14", "PROBATION_REVIEW", "SyllabusTopic", "Syllabus progress by Kamran Ali", "Kamran Ali", "2026-10-05T08:45:00Z", "COORDINATOR",
            listOf("action" to "Syllabus topic progress", "topicTitle" to "States of matter", "status" to "COMPLETED", "completedOn" to "2026-10-05", "note" to "Covered with lab demo"),
        ),
    )
}
