package com.schoolapp.feature.staff.documents

import com.schoolapp.core.common.time.TimeFormat
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.staff.documents.DocumentStatus
import com.schoolapp.feature.staff.R
import java.time.Instant
import java.time.format.DateTimeParseException

/** Same labels as the web: "B-Form", "CNIC", otherwise BIRTH_CERTIFICATE -> "Birth certificate". */
internal fun docTypeLabel(type: String): String = when (type) {
    "B_FORM" -> "B-Form"
    "CNIC" -> "CNIC"
    else -> type.replace(Regex("[_-]+"), " ").lowercase().replaceFirstChar { it.uppercase() }
}

internal fun DocumentStatus.labelRes(): Int = when (this) {
    DocumentStatus.UPLOADED -> R.string.staff_docs_status_uploaded
    DocumentStatus.VERIFIED -> R.string.staff_docs_status_verified
    DocumentStatus.REJECTED -> R.string.staff_docs_status_rejected
}

internal fun DocumentStatus.tone(): StatusTone = when (this) {
    DocumentStatus.UPLOADED -> StatusTone.Warning
    DocumentStatus.VERIFIED -> StatusTone.Success
    DocumentStatus.REJECTED -> StatusTone.Error
}

/** ISO instant -> "14 Oct 2026, 3:05 PM"; unparseable values are shown as-is. */
internal fun formatCheckedAt(iso: String): String = try {
    TimeFormat.formatDateTime12(Instant.parse(iso))
} catch (e: DateTimeParseException) {
    iso
}
