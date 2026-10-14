package com.schoolapp.core.model.staff.documents

/** One record attached to a staff member (`GET /documents?ownerType=STAFF`). [verifiedAt] is ISO UTC. */
data class StaffDocument(
    val id: String,
    val docType: String,
    val fileUrl: String?,
    val mime: String?,
    val status: DocumentStatus,
    val note: String?,
    val verifiedByName: String?,
    val verifiedAt: String?,
)

enum class DocumentStatus {
    UPLOADED, VERIFIED, REJECTED;

    companion object {
        fun fromApi(value: String?): DocumentStatus = entries.firstOrNull { it.name == value } ?: UPLOADED
    }
}

/** `DocumentType` values the API accepts, in the order the web form lists them. */
object DocumentTypes {
    val all: List<String> = listOf(
        "BIRTH_CERTIFICATE", "B_FORM", "CNIC", "PHOTO", "PREVIOUS_RESULT", "LEAVING_CERTIFICATE", "MEDICAL", "OTHER",
    )
}
