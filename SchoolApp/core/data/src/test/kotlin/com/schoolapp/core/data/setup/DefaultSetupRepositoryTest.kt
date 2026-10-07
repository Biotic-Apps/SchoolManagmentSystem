package com.schoolapp.core.data.setup

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.setup.SetupChecklist
import com.schoolapp.core.model.setup.SetupItem
import com.schoolapp.core.model.setup.SetupStep
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.NetworkJson
import com.schoolapp.core.network.api.SetupApi
import com.schoolapp.core.network.dto.setup.SetupChecklistDto
import com.schoolapp.core.network.dto.setup.SetupItemDto
import com.schoolapp.core.network.model.ApiEnvelope
import kotlinx.coroutines.test.UnconfinedTestDispatcher
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.IOException

class DefaultSetupRepositoryTest {

    private val dispatcher = UnconfinedTestDispatcher()
    private val api = FakeSetupApi()
    private val repository = DefaultSetupRepository(api, ApiCaller(NetworkJson, dispatcher))

    /** The example body from docs/api/school-setup-contract.md section 2. */
    private val contractJson = """
        { "data": { "branchId": "b1", "complete": false, "items": [
          { "key": "session",   "done": true,  "count": 1 },
          { "key": "classes",   "done": true,  "count": 13 },
          { "key": "subjects",  "done": true,  "count": 8 },
          { "key": "teachers",  "done": false, "count": 0 },
          { "key": "students",  "done": false, "count": 0 },
          { "key": "timetable", "done": false, "count": 0 },
          { "key": "feePlan",   "done": false, "count": 0 }
        ] } }
    """.trimIndent()

    @Test
    fun contract_example_maps_every_step_in_order() = runTest(dispatcher) {
        api.response = NetworkJson.decodeFromString<ApiEnvelope<SetupChecklistDto>>(contractJson).data
        val result = repository.checklist("b1") as AppResult.Success
        val expected = SetupChecklist(
            "b1", false,
            listOf(
                SetupItem(SetupStep.SESSION, true, 1), SetupItem(SetupStep.CLASSES, true, 13),
                SetupItem(SetupStep.SUBJECTS, true, 8), SetupItem(SetupStep.TEACHERS, false, 0),
                SetupItem(SetupStep.STUDENTS, false, 0), SetupItem(SetupStep.TIMETABLE, false, 0),
                SetupItem(SetupStep.FEE_PLAN, false, 0),
            ),
        )
        assertEquals(expected, result.data)
        assertEquals(listOf<String?>("b1"), api.calls)
    }

    @Test
    fun unknown_and_duplicate_keys_are_dropped_and_order_is_fixed() = runTest(dispatcher) {
        api.response = NetworkJson.decodeFromString<SetupChecklistDto>(
            """{ "complete": false, "items": [
                 { "key": "feePlan", "count": 2 }, { "key": "transport", "count": 0 },
                 { "key": "session", "done": false, "count": 0 }, { "key": "feePlan", "count": 0 } ] }""",
        )
        val data = (repository.checklist(null) as AppResult.Success).data
        assertEquals(listOf(SetupStep.SESSION, SetupStep.FEE_PLAN), data.items.map { it.step })
        assertTrue("a positive count counts as done", data.items.last().done)
        assertFalse(data.complete)
        assertNull(data.branchId)
    }

    @Test
    fun all_known_steps_done_is_complete() = runTest(dispatcher) {
        api.response = SetupChecklistDto(items = SetupStep.entries.map { SetupItemDto(it.key, true, 1) })
        assertTrue((repository.checklist(null) as AppResult.Success).data.complete)
    }

    @Test
    fun network_failure_maps_to_app_error() = runTest(dispatcher) {
        api.fail = IOException("offline")
        assertEquals(AppResult.Failure(AppError.Network), repository.checklist(null))
    }

    private class FakeSetupApi : SetupApi {
        val calls = mutableListOf<String?>()
        var response = SetupChecklistDto()
        var fail: Exception? = null

        override suspend fun checklist(branchId: String?): ApiEnvelope<SetupChecklistDto> {
            calls += branchId
            fail?.let { throw it }
            return ApiEnvelope(response)
        }
    }
}
