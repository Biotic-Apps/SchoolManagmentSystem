package com.schoolapp.core.data.documents

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.documents.SchoolDocument

/** Records attached to a student (`/documents?ownerType=STUDENT`); upload / verify / reject need `students.edit`. */
interface StudentDocumentsRepository {
    suspend fun list(studentId: String): AppResult<List<SchoolDocument>>

    /** [fileId] comes from `POST /files` with purpose DOCUMENT. */
    suspend fun attach(studentId: String, docType: String, fileId: String, note: String?): AppResult<SchoolDocument>

    suspend fun verify(id: String, note: String?): AppResult<SchoolDocument>

    /** [reason] 3..500 characters; the uploader sees it. */
    suspend fun reject(id: String, reason: String): AppResult<SchoolDocument>
}
