package com.schoolapp.core.data.attendance

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.fakes.CountingSyncScheduler
import com.schoolapp.core.data.fakes.InMemoryAttendanceRegisterDao
import com.schoolapp.core.data.fakes.InMemoryOutboxDao
import com.schoolapp.core.data.fakes.httpError
import com.schoolapp.core.model.attendance.AttendanceStatus
import com.schoolapp.core.model.attendance.EntryMark
import com.schoolapp.core.model.attendance.LoadedRegister
import com.schoolapp.core.model.attendance.RegisterOutcome
import com.schoolapp.core.model.attendance.RegisterStatus
import com.schoolapp.core.model.attendance.RegisterSyncState
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.NetworkJson
import com.schoolapp.core.network.api.AttendanceApi
import com.schoolapp.core.network.dto.attendance.CorrectionBodyDto
import com.schoolapp.core.network.dto.attendance.RegisterBodyDto
import com.schoolapp.core.network.dto.attendance.RegisterDto
import com.schoolapp.core.network.dto.attendance.RegisterEntryDto
import com.schoolapp.core.network.dto.attendance.SectionAttendanceDto
import com.schoolapp.core.network.dto.attendance.StudentAttendanceDto
import com.schoolapp.core.network.dto.attendance.UnmarkedSectionDto
import com.schoolapp.core.network.model.ApiEnvelope
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.test.UnconfinedTestDispatcher
import kotlinx.coroutines.test.runTest
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.jsonObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.IOException

class DefaultAttendanceRepositoryTest {

    private val dispatcher = UnconfinedTestDispatcher()
    private val api = FakeAttendanceApi()
    private val registers = InMemoryAttendanceRegisterDao()
    private val outbox = InMemoryOutboxDao()
    private val sync = CountingSyncScheduler()
    private val repository = DefaultAttendanceRepository(
        api, ApiCaller(NetworkJson, dispatcher), registers, outbox, sync, NetworkJson, dispatcher,
    )
    private val marks = listOf(EntryMark("s1", AttendanceStatus.PRESENT), EntryMark("s2", AttendanceStatus.ABSENT, " sick "))

    private fun register(date: String, status: String, vararg statuses: String?) = RegisterDto(
        id = "r-$date", sectionId = "sec", date = date, status = status, version = 1,
        entries = statuses.mapIndexed { i, s -> RegisterEntryDto(studentId = "s${i + 1}", name = "Student ${i + 1}", rollNo = i + 1, status = s) },
    )

    @Test
    fun offline_submit_is_queued_with_local_marks_kept() = runTest(dispatcher) {
        api.fail = IOException("offline")
        val result = repository.submit("sec", "2026-10-06", marks, "req-12345")

        assertEquals(AppResult.Success(RegisterOutcome.Queued), result)
        val row = outbox.rows.value.single()
        assertEquals("POST", row.method)
        assertEquals("attendance/registers/submit", row.path)
        assertEquals("req-12345", row.clientRequestId)
        assertEquals(DefaultAttendanceRepository.OUTBOX_SUBMIT, row.type)
        val body = NetworkJson.decodeFromString(RegisterBodyDto.serializer(), row.payloadJson)
        assertEquals("req-12345", body.clientRequestId)
        assertEquals("sick", body.entries[1].remark)
        assertEquals(1, sync.requests)
        assertEquals(RegisterSyncState.QUEUED, repository.syncState("sec", "2026-10-06").first())
        assertNotNull(registers.rows["sec" to "2026-10-06"]?.localMarksJson)
    }

    @Test
    fun offline_open_of_new_date_uses_latest_roster_and_local_marks() = runTest(dispatcher) {
        api.registers["2026-10-05"] = register("2026-10-05", "SUBMITTED", "PRESENT", "LATE")
        repository.register("sec", "2026-10-05")
        api.fail = IOException("offline")
        repository.saveDraft("sec", "2026-10-06", marks, "req-draft-1")

        val loaded = (repository.register("sec", "2026-10-06") as AppResult.Success<LoadedRegister>).data
        assertTrue(loaded.offline)
        assertEquals(RegisterStatus.UNMARKED, loaded.register.status)
        assertEquals("2026-10-06", loaded.register.date)
        assertEquals(listOf<AttendanceStatus?>(null, null), loaded.register.entries.map { it.status })
        assertEquals(listOf("s1", "s2"), loaded.localMarks?.map { it.studentId })
    }

    @Test
    fun offline_with_no_cache_returns_network_failure() = runTest(dispatcher) {
        api.fail = IOException("offline")
        assertEquals(AppResult.Failure(AppError.Network), repository.register("sec", "2026-10-06"))
    }

    @Test
    fun conflict_on_submit_returns_refetched_register_and_keeps_marks() = runTest(dispatcher) {
        api.registers["2026-10-06"] = register("2026-10-06", "SUBMITTED", "PRESENT", "PRESENT")
        api.mutationError = httpError(409, "ALREADY_SUBMITTED")

        val outcome = (repository.submit("sec", "2026-10-06", marks, "req-conflict") as AppResult.Success).data

        val current = (outcome as RegisterOutcome.AlreadySubmitted).current
        assertEquals(RegisterStatus.SUBMITTED, current?.status)
        assertEquals(1, api.registerCalls)
        assertNotNull(registers.rows["sec" to "2026-10-06"]?.localMarksJson)
        assertTrue(outbox.rows.value.isEmpty())
    }

    @Test
    fun locked_register_maps_to_locked() = runTest(dispatcher) {
        api.mutationError = httpError(423, "RECORD_LOCKED")
        assertEquals(AppResult.Success(RegisterOutcome.Locked), repository.submit("sec", "2026-10-06", marks, "req-locked"))
    }

    @Test
    fun saved_submit_caches_server_copy_and_clears_local_marks() = runTest(dispatcher) {
        api.mutationResponse = NetworkJson.encodeToJsonElement(RegisterDto.serializer(), register("2026-10-06", "SUBMITTED", "PRESENT", "ABSENT")).jsonObject

        val outcome = (repository.submit("sec", "2026-10-06", marks, "req-ok") as AppResult.Success).data

        assertEquals(RegisterStatus.SUBMITTED, (outcome as RegisterOutcome.Saved).register.status)
        assertEquals("req-ok", api.lastKey)
        assertNull(registers.rows["sec" to "2026-10-06"]?.localMarksJson)
    }

    @Test
    fun probation_hold_becomes_pending_review() = runTest(dispatcher) {
        api.mutationResponse = NetworkJson.parseToJsonElement("""{"status":"PENDING_REVIEW","approvalId":"ap-9"}""").jsonObject
        assertEquals(AppResult.Success(RegisterOutcome.PendingReview("ap-9")), repository.submit("sec", "2026-10-06", marks, "req-review"))
    }

    @Test
    fun discard_clears_local_marks_and_queued_rows() = runTest(dispatcher) {
        api.fail = IOException("offline")
        repository.saveDraft("sec", "2026-10-06", marks, "req-discard")
        repository.discardLocal("sec", "2026-10-06")
        assertTrue(outbox.rows.value.isEmpty())
        assertNull(registers.rows["sec" to "2026-10-06"]?.localMarksJson)
        assertEquals(RegisterSyncState.NONE, repository.syncState("sec", "2026-10-06").first())
    }

    private class FakeAttendanceApi : AttendanceApi {
        val registers = mutableMapOf<String, RegisterDto>()
        var fail: Exception? = null
        var mutationError: Exception? = null
        var mutationResponse: JsonObject = JsonObject(emptyMap())
        var registerCalls = 0
        var lastKey: String? = null

        override suspend fun register(sectionId: String, date: String): ApiEnvelope<RegisterDto> {
            fail?.let { throw it }
            registerCalls++
            return ApiEnvelope(registers[date] ?: RegisterDto(sectionId = sectionId, date = date, status = "UNMARKED"))
        }

        override suspend fun saveDraft(body: RegisterBodyDto, idempotencyKey: String) = mutate(idempotencyKey)
        override suspend fun submit(body: RegisterBodyDto, idempotencyKey: String) = mutate(idempotencyKey)

        private fun mutate(key: String): ApiEnvelope<JsonObject> {
            fail?.let { throw it }
            mutationError?.let { throw it }
            lastKey = key
            return ApiEnvelope(mutationResponse)
        }

        override suspend fun requestCorrection(body: CorrectionBodyDto) = Unit
        override suspend fun studentHistory(studentId: String, from: String?, to: String?) = ApiEnvelope(StudentAttendanceDto())
        override suspend fun summary(branchId: String?, date: String) = ApiEnvelope(emptyList<SectionAttendanceDto>())
        override suspend fun unmarked(branchId: String?, date: String) = ApiEnvelope(emptyList<UnmarkedSectionDto>())
        override suspend fun myStaffAttendance(from: String?, to: String?): ApiEnvelope<JsonElement> = ApiEnvelope(JsonObject(emptyMap()))
    }
}
