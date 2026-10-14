package com.schoolapp.feature.students.detail.documents

import com.schoolapp.core.common.result.AppError

/** Upload sheet: the file goes to `POST /files` as soon as it is picked; Save attaches it to the student. */
internal data class DocumentUploadForm(
    val docType: String? = null,
    val fileUri: String? = null,
    val fileName: String? = null,
    val fileId: String? = null,
    val isUploadingFile: Boolean = false,
    val fileError: AppError? = null,
    val fileTypeInvalid: Boolean = false,
    val note: String = "",
    val showErrors: Boolean = false,
    val isSaving: Boolean = false,
    val saveError: AppError? = null,
) {
    val issues: Set<UploadIssue>
        get() = buildSet {
            if (docType == null) add(UploadIssue.TYPE_REQUIRED)
            when {
                fileTypeInvalid -> add(UploadIssue.FILE_TYPE)
                isUploadingFile -> add(UploadIssue.FILE_UPLOADING)
                fileId == null -> add(UploadIssue.FILE_REQUIRED)
            }
            if (note.trim().length > NOTE_MAX) add(UploadIssue.NOTE_TOO_LONG)
        }

    companion object {
        const val NOTE_MAX = 255

        fun isAllowedMime(mime: String?): Boolean = mime == null || mime.startsWith("image/") || mime == PDF

        const val PDF = "application/pdf"
    }
}

internal enum class UploadIssue { TYPE_REQUIRED, FILE_REQUIRED, FILE_UPLOADING, FILE_TYPE, NOTE_TOO_LONG }
