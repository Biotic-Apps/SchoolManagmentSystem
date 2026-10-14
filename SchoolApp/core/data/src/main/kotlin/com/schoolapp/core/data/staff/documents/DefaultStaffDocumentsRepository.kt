package com.schoolapp.core.data.staff.documents

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.staff.documents.DocumentStatus
import com.schoolapp.core.model.staff.documents.StaffDocument
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.staff.DocumentsApi
import com.schoolapp.core.network.dto.people.DocumentDto
import com.schoolapp.core.network.dto.staff.documents.CreateDocumentRequest
import com.schoolapp.core.network.dto.staff.documents.RejectDocumentRequest
import com.schoolapp.core.network.dto.staff.documents.VerifyDocumentRequest
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DefaultStaffDocumentsRepository @Inject constructor(
    private val api: DocumentsApi,
    private val apiCaller: ApiCaller,
) : StaffDocumentsRepository {

    override suspend fun list(staffId: String): AppResult<List<StaffDocument>> =
        apiCaller.call { api.list(OWNER_TYPE, staffId).data.map { it.toStaffDocument() } }

    override suspend fun attach(staffId: String, docType: String, fileId: String, note: String?): AppResult<StaffDocument> =
        apiCaller.call {
            val body = CreateDocumentRequest(OWNER_TYPE, staffId, docType, fileId, note?.trim()?.ifEmpty { null })
            api.create(body).data.toStaffDocument()
        }

    override suspend fun verify(id: String, note: String?): AppResult<StaffDocument> =
        apiCaller.call { api.verify(id, VerifyDocumentRequest(note?.trim()?.ifEmpty { null })).data.toStaffDocument() }

    override suspend fun reject(id: String, reason: String): AppResult<StaffDocument> =
        apiCaller.call { api.reject(id, RejectDocumentRequest(reason.trim())).data.toStaffDocument() }

    private companion object {
        const val OWNER_TYPE = "STAFF"
    }
}

internal fun DocumentDto.toStaffDocument() = StaffDocument(
    id = id,
    docType = docType,
    fileUrl = file?.url,
    mime = file?.mime,
    status = DocumentStatus.fromApi(status),
    note = note,
    verifiedByName = verifiedBy?.name,
    verifiedAt = verifiedAt,
)
