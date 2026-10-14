package com.schoolapp.core.data.staff.documents

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.staff.documents.StaffDocument

/** Staff records (CNIC, degrees, ...). The API has no delete: rejecting is how a wrong upload is set aside. */
interface StaffDocumentsRepository {
    suspend fun list(staffId: String): AppResult<List<StaffDocument>>

    suspend fun attach(staffId: String, docType: String, fileId: String, note: String?): AppResult<StaffDocument>

    suspend fun verify(id: String, note: String?): AppResult<StaffDocument>

    suspend fun reject(id: String, reason: String): AppResult<StaffDocument>
}
