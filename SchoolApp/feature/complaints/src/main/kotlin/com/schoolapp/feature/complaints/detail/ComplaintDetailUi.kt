package com.schoolapp.feature.complaints.detail

import androidx.compose.runtime.Immutable
import com.schoolapp.core.model.complaint.Complaint
import com.schoolapp.core.model.complaint.ComplaintStatus

/** Who filed it, as the viewer may see it. */
sealed interface ComplainantDisplay {
    data object Anonymous : ComplainantDisplay
    data class Named(val name: String, val role: String?) : ComplainantDisplay
}

/** Detail plus what the viewer may do with it. */
@Immutable
data class ComplaintDetailUi(
    val complaint: Complaint,
    val complainant: ComplainantDisplay,
    val isAssignee: Boolean,
    val isComplainant: Boolean,
    val canAddUpdate: Boolean,
    val canEscalate: Boolean,
    val canComment: Boolean,
    val canClose: Boolean,
    val canReopen: Boolean,
    val canAssign: Boolean = false,
) {
    val hasActions: Boolean get() = canAddUpdate || canEscalate || canComment || canClose || canReopen || canAssign
}

/**
 * Maps the server record for [viewerUserId]; [openedAsComplainant] covers anonymous complaints
 * the viewer filed (the server may hide the complainant even from them). [canManage] is the
 * `complaints.edit` permission: supervisors may (re)assign while the complaint is still open.
 */
fun Complaint.toDetailUi(viewerUserId: String?, openedAsComplainant: Boolean, canManage: Boolean = false): ComplaintDetailUi {
    val isAssignee = viewerUserId != null && assignee?.id == viewerUserId
    val isComplainant = (viewerUserId != null && complainant?.id == viewerUserId) || (openedAsComplainant && !isAssignee)
    val resolved = status == ComplaintStatus.RESOLVED
    return ComplaintDetailUi(
        complaint = this,
        complainant = complainant?.let { ComplainantDisplay.Named(it.name, complainantRole) } ?: ComplainantDisplay.Anonymous,
        isAssignee = isAssignee,
        isComplainant = isComplainant,
        canAddUpdate = isAssignee && isOpen,
        canEscalate = isAssignee && isOpen,
        canComment = isComplainant && !isAssignee && status != ComplaintStatus.CLOSED,
        canClose = isComplainant && resolved,
        canReopen = isComplainant && resolved,
        canAssign = canManage && isOpen,
    )
}
