package com.schoolapp.core.data.documents

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.staff.documents.toStaffDocument
import com.schoolapp.core.model.documents.SchoolDocument
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.staff.DocumentsApi
import com.schoolapp.core.network.dto.staff.documents.CreateDocumentRequest
import com.schoolapp.core.network.dto.staff.documents.RejectDocumentRequest
import com.schoolapp.core.network.dto.staff.documents.VerifyDocumentRequest
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DefaultStudentDocumentsRepository @Inject constructor(
    private val api: DocumentsApi,
    private val apiCaller: ApiCaller,
) : StudentDocumentsRepository {

    override suspend fun list(studentId: String): AppResult<List<SchoolDocument>> =
        apiCaller.call { api.list(OWNER_TYPE, studentId).data.map { it.toStaffDocument() } }

    override suspend fun attach(studentId: String, docType: String, fileId: String, note: String?): AppResult<SchoolDocument> =
        apiCaller.call {
            val body = CreateDocumentRequest(OWNER_TYPE, studentId, docType, fileId, note?.trim()?.ifEmpty { null })
            api.create(body).data.toStaffDocument()
        }

    override suspend fun verify(id: String, note: String?): AppResult<SchoolDocument> =
        apiCaller.call { api.verify(id, VerifyDocumentRequest(note?.trim()?.ifEmpty { null })).data.toStaffDocument() }

    override suspend fun reject(id: String, reason: String): AppResult<SchoolDocument> =
        apiCaller.call { api.reject(id, RejectDocumentRequest(reason.trim())).data.toStaffDocument() }

    private companion object {
        const val OWNER_TYPE = "STUDENT"
    }
}
