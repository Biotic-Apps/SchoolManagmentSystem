package com.schoolapp.core.data.attendance

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.fakes.httpError
import com.schoolapp.core.model.attendance.AttendanceStatus
import com.schoolapp.core.model.attendance.StaffMark
import com.schoolapp.core.model.attendance.StaffRosterEntry
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.NetworkJson
import com.schoolapp.core.network.api.StaffAttendanceApi
import com.schoolapp.core.network.dto.attendance.StaffAttendanceBodyDto
import com.schoolapp.core.network.dto.attendance.StaffAttendanceSheetDto
import com.schoolapp.core.network.model.ApiEnvelope
import kotlinx.coroutines.test.UnconfinedTestDispatcher
import kotlinx.coroutines.test.runTest
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.IOException

class DefaultStaffAttendanceRepositoryTest {

    private val dispatcher = UnconfinedTestDispatcher()
    private val api = FakeStaffAttendanceApi()
    private val repository = DefaultStaffAttendanceRepository(api, ApiCaller(NetworkJson, dispatcher))

    private val apiDay = """
        {"branchId":"b1","date":"2026-10-06","entries":[
          {"staff":{"id":"st1","name":"Sana Iqbal"},"designation":"Coordinator","status":"PRESENT","checkIn":"07:50","checkOut":null,"remark":" "},
          {"staff":{"id":"st2","name":"Bilal Ahmed"},"designation":"Teacher","status":null,"checkIn":null,"checkOut":null,"remark":null},
          {"staffId":"st3","name":"Flat Row","status":"HALF_DAY"},
          {"designation":"No id","status":"ABSENT"}
        ]}
    """.trimIndent()

    @Test
    fun sheet_reads_nested_and_flat_rows_and_drops_rows_without_id() = runTest(dispatcher) {
        api.day = NetworkJson.decodeFromString(StaffAttendanceSheetDto.serializer(), apiDay)

        val sheet = (repository.sheet("b1", "2026-10-06") as AppResult.Success).data

        assertEquals("b1" to "2026-10-06", api.lastQuery)
        assertEquals(listOf("st1", "st2", "st3"), sheet.entries.map { it.staffId })
        assertEquals(
            StaffRosterEntry("st1", "Sana Iqbal", "Coordinator", null, AttendanceStatus.PRESENT, "07:50", null, null),
            sheet.entries[0],
        )
        assertEquals(null, sheet.entries[1].status)
        assertEquals("Flat Row", sheet.entries[2].name)
        assertEquals(AttendanceStatus.HALF_DAY, sheet.entries[2].status)
    }

    @Test
    fun sheet_falls_back_to_requested_branch_and_date() = runTest(dispatcher) {
        api.day = StaffAttendanceSheetDto()

        val sheet = (repository.sheet("b9", "2026-10-01") as AppResult.Success).data

        assertEquals("b9", sheet.branchId)
        assertEquals("2026-10-01", sheet.date)
        assertTrue(sheet.entries.isEmpty())
    }

    @Test
    fun save_sends_marks_without_times_for_absent_or_leave_and_trims_remarks() = runTest(dispatcher) {
        api.day = NetworkJson.decodeFromString(StaffAttendanceSheetDto.serializer(), apiDay)
        val marks = listOf(
            StaffMark("st1", AttendanceStatus.LATE, "08:10", "14:00", " Traffic "),
            StaffMark("st2", AttendanceStatus.ABSENT, "08:00", "14:00", "  "),
            StaffMark("st3", AttendanceStatus.LEAVE, checkIn = "08:00"),
        )

        val result = repository.save("b1", "2026-10-06", marks)

        assertTrue(result is AppResult.Success)
        val body = api.saved.single()
        assertEquals("b1", body.branchId)
        assertEquals("2026-10-06", body.date)
        assertEquals(listOf("LATE", "ABSENT", "LEAVE"), body.entries.map { it.status })
        assertEquals("08:10", body.entries[0].checkIn)
        assertEquals("Traffic", body.entries[0].remark)
        assertEquals(null, body.entries[1].checkIn)
        assertEquals(null, body.entries[1].checkOut)
        assertEquals(null, body.entries[1].remark)
        assertEquals(null, body.entries[2].checkIn)
    }

    @Test
    fun save_body_omits_null_fields_on_the_wire() {
        val body = StaffAttendanceBodyDto("b1", "2026-10-06", listOf(StaffMark("st2", AttendanceStatus.ABSENT).toDto()))
        val entry = NetworkJson.encodeToJsonElement(StaffAttendanceBodyDto.serializer(), body).jsonObject["entries"]!!.jsonArray[0].jsonObject

        assertEquals(setOf("staffId", "status"), entry.keys)
    }

    @Test
    fun save_maps_non_working_day_and_offline_errors() = runTest(dispatcher) {
        api.fail = httpError(400, "VALIDATION_FAILED")
        val invalid = repository.save("b1", "2026-10-05", listOf(StaffMark("st1", AttendanceStatus.PRESENT)))
        assertTrue((invalid as AppResult.Failure).error is AppError.Validation)

        api.fail = IOException("offline")
        val offline = repository.sheet("b1", "2026-10-05")
        assertEquals(AppError.Network, (offline as AppResult.Failure).error)
        assertFalse(api.saved.isNotEmpty())
    }

    private class FakeStaffAttendanceApi : StaffAttendanceApi {
        var day = StaffAttendanceSheetDto()
        var fail: Exception? = null
        var lastQuery: Pair<String, String>? = null
        val saved = mutableListOf<StaffAttendanceBodyDto>()

        override suspend fun sheet(branchId: String, date: String): ApiEnvelope<StaffAttendanceSheetDto> {
            fail?.let { throw it }
            lastQuery = branchId to date
            return ApiEnvelope(day)
        }

        override suspend fun save(body: StaffAttendanceBodyDto): ApiEnvelope<StaffAttendanceSheetDto> {
            fail?.let { throw it }
            saved += body
            return ApiEnvelope(day)
        }
    }
}
