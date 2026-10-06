package com.schoolapp.feature.students.profile

import androidx.compose.foundation.lazy.LazyListScope
import com.schoolapp.core.model.people.StudentDetail
import com.schoolapp.core.ui.ExternalActions

/** The profile cards shared by the staff student detail and the parent's child profile. */
internal fun LazyListScope.studentProfileItems(detail: StudentDetail, actions: ExternalActions) {
    item(key = "header") { StudentHeaderCard(detail.summary) }
    item(key = "guardians") { GuardiansCard(detail.guardians, onCall = actions::dial, onSms = actions::sms) }
    item(key = "enrollment") { EnrollmentCard(detail.enrollment) }
    item(key = "info") { StudentInfoCard(detail) }
    item(key = "documents") { DocumentsCard(detail.documents, onOpen = actions::open) }
}
