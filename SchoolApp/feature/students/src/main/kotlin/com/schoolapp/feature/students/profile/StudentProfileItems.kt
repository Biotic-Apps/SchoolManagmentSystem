package com.schoolapp.feature.students.profile

import androidx.compose.foundation.lazy.LazyListScope
import com.schoolapp.core.model.people.StudentDetail
import com.schoolapp.core.ui.ExternalActions

/** The profile cards shared by the staff student detail and the parent's child profile. */
internal fun LazyListScope.studentProfileItems(
    detail: StudentDetail,
    actions: ExternalActions,
    afterHeader: (LazyListScope.() -> Unit)? = null,
    onEditGuardian: ((String) -> Unit)? = null,
    onAddGuardian: (() -> Unit)? = null,
) {
    item(key = "header") { StudentHeaderCard(detail.summary) }
    afterHeader?.invoke(this)
    item(key = "guardians") {
        GuardiansCard(detail.guardians, onCall = actions::dial, onSms = actions::sms, onEdit = onEditGuardian, onAdd = onAddGuardian)
    }
    item(key = "enrollment") { EnrollmentCard(detail.enrollment) }
    item(key = "info") { StudentInfoCard(detail) }
    item(key = "documents") { DocumentsCard(detail.documents, onOpen = actions::open) }
}
