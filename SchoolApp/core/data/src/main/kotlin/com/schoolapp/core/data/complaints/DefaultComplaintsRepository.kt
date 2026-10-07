package com.schoolapp.core.data.complaints

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.common.clean
import com.schoolapp.core.data.common.orNullIfEmpty
import com.schoolapp.core.model.complaint.Complaint
import com.schoolapp.core.model.complaint.ComplaintBox
import com.schoolapp.core.model.complaint.ComplaintInput
import com.schoolapp.core.model.complaint.ComplaintStatus
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.ComplaintsApi
import com.schoolapp.core.network.dto.common.ReasonBodyDto
import com.schoolapp.core.network.dto.complaint.AssignComplaintBodyDto
import com.schoolapp.core.network.dto.complaint.ComplaintDto
import com.schoolapp.core.network.dto.complaint.ComplaintUpdateBodyDto
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DefaultComplaintsRepository @Inject constructor(
    private val api: ComplaintsApi,
    private val apiCaller: ApiCaller,
    private val json: Json,
) : ComplaintsRepository {

    override suspend fun complaints(box: ComplaintBox, status: ComplaintStatus?): AppResult<List<Complaint>> =
        apiCaller.call {
            api.complaints(box.name.lowercase(), status?.name).data.map { it.toModel() }
                .sortedByDescending { it.createdAt.orEmpty() }
        }

    override suspend fun complaint(id: String): AppResult<Complaint> = apiCaller.call { api.complaint(id).data.toModel() }

    override suspend fun file(input: ComplaintInput): AppResult<Complaint> =
        apiCaller.call { api.file(input.toBody()).data.toModel() }

    override suspend fun assign(id: String, assigneeUserId: String): AppResult<Complaint> =
        action(id) { api.assign(id, AssignComplaintBodyDto(assigneeUserId)).data }

    override suspend fun addUpdate(
        id: String,
        message: String,
        status: ComplaintStatus?,
        attachmentFileIds: List<String>,
    ): AppResult<Complaint> = action(id) {
        api.addUpdate(id, ComplaintUpdateBodyDto(message.trim(), status?.name, attachmentFileIds.orNullIfEmpty())).data
    }

    override suspend fun escalate(id: String, reason: String?): AppResult<Complaint> =
        action(id) { api.escalate(id, ReasonBodyDto(reason.clean())).data }

    override suspend fun close(id: String, reason: String?): AppResult<Complaint> =
        action(id) { api.close(id, ReasonBodyDto(reason.clean())).data }

    override suspend fun reopen(id: String, reason: String?): AppResult<Complaint> =
        action(id) { api.reopen(id, ReasonBodyDto(reason.clean())).data }

    /** Actions may answer the complaint or only the new update; in the latter case the complaint is re-read. */
    private suspend fun action(id: String, call: suspend () -> JsonObject): AppResult<Complaint> = apiCaller.call {
        val response = call()
        if (response.containsKey("ticketNo")) {
            json.decodeFromJsonElement(ComplaintDto.serializer(), response).toModel()
        } else {
            api.complaint(id).data.toModel()
        }
    }
}
