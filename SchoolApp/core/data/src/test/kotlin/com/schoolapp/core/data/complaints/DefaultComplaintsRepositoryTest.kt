package com.schoolapp.core.data.complaints

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.complaint.ComplaintStatus
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.NetworkJson
import com.schoolapp.core.network.api.ComplaintsApi
import com.schoolapp.core.network.dto.common.ReasonBodyDto
import com.schoolapp.core.network.dto.complaint.AssignComplaintBodyDto
import com.schoolapp.core.network.dto.complaint.ComplaintBodyDto
import com.schoolapp.core.network.dto.complaint.ComplaintDto
import com.schoolapp.core.network.dto.complaint.ComplaintUpdateBodyDto
import com.schoolapp.core.network.model.ApiEnvelope
import kotlinx.coroutines.test.UnconfinedTestDispatcher
import kotlinx.coroutines.test.runTest
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.jsonObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class DefaultComplaintsRepositoryTest {

    private val dispatcher = UnconfinedTestDispatcher()
    private val api = FakeComplaintsApi()
    private val repository = DefaultComplaintsRepository(api, ApiCaller(NetworkJson, dispatcher), NetworkJson)

    @Test
    fun assign_posts_the_user_id_and_reads_the_returned_complaint() = runTest(dispatcher) {
        val result = repository.assign("c1", "u7")

        assertEquals(listOf("c1" to AssignComplaintBodyDto("u7")), api.assigned)
        val complaint = (result as AppResult.Success).data
        assertEquals("u7", complaint.assignee?.id)
        assertEquals(ComplaintStatus.ASSIGNED, complaint.status)
    }

    @Test
    fun update_sends_attachment_ids_and_omits_an_empty_list() = runTest(dispatcher) {
        repository.addUpdate("c1", " Fixed the fan ", ComplaintStatus.RESOLVED, listOf("f1", "f2"))
        repository.addUpdate("c1", "Thanks")

        val (first, second) = api.updates
        assertEquals(ComplaintUpdateBodyDto("Fixed the fan", "RESOLVED", listOf("f1", "f2")), first)
        assertNull(second.attachmentFileIds)
        assertNull(second.status)
    }

    @Test
    fun update_attachments_are_mapped_on_the_timeline() = runTest(dispatcher) {
        val complaint = (repository.complaint("c1") as AppResult.Success).data
        val attachment = complaint.updates.single().attachments.single()
        assertEquals("f9", attachment.id)
        assertEquals("photo.jpg", attachment.name)
        assertEquals(true, attachment.isImage)
    }
}

private class FakeComplaintsApi : ComplaintsApi {
    val assigned = mutableListOf<Pair<String, AssignComplaintBodyDto>>()
    val updates = mutableListOf<ComplaintUpdateBodyDto>()

    private fun complaintJson(assigneeId: String = "u2", status: String = "ASSIGNED") =
        """{"id":"c1","ticketNo":"CMP-1","category":"FACILITY","subject":"Fan","description":"Room 4","status":"$status",
           "assignee":{"id":"$assigneeId","name":"Staff"},
           "updates":[{"id":"cu1","author":{"id":"u2","name":"Staff"},"message":"Looking","status":null,"at":"2026-10-06T05:00:00Z",
                       "attachments":[{"id":"f9","url":"https://x/f9","mime":"image/jpeg","name":"photo.jpg"}]}]}"""

    private fun dto(json: String) = NetworkJson.decodeFromString(ComplaintDto.serializer(), json)
    private fun obj(json: String): JsonObject = NetworkJson.parseToJsonElement(json).jsonObject

    override suspend fun complaints(box: String, status: String?, category: String?) = ApiEnvelope(listOf(dto(complaintJson())))
    override suspend fun complaint(id: String) = ApiEnvelope(dto(complaintJson()))
    override suspend fun file(body: ComplaintBodyDto) = ApiEnvelope(dto(complaintJson()))

    override suspend fun assign(id: String, body: AssignComplaintBodyDto): ApiEnvelope<JsonObject> {
        assigned += id to body
        return ApiEnvelope(obj(complaintJson(assigneeId = body.assigneeUserId)))
    }

    override suspend fun addUpdate(id: String, body: ComplaintUpdateBodyDto): ApiEnvelope<JsonObject> {
        updates += body
        return ApiEnvelope(obj(complaintJson()))
    }

    override suspend fun escalate(id: String, body: ReasonBodyDto) = ApiEnvelope(obj(complaintJson()))
    override suspend fun close(id: String, body: ReasonBodyDto) = ApiEnvelope(obj(complaintJson()))
    override suspend fun reopen(id: String, body: ReasonBodyDto) = ApiEnvelope(obj(complaintJson()))
}
