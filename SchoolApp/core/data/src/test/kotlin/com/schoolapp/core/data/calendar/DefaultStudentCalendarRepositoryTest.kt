package com.schoolapp.core.data.calendar

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.fakes.httpError
import com.schoolapp.core.model.organisation.CalendarEvent
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.NetworkJson
import com.schoolapp.core.network.api.OrganisationApi
import com.schoolapp.core.network.dto.organisation.CalendarEventDto
import com.schoolapp.core.network.model.ApiEnvelope
import kotlinx.coroutines.test.UnconfinedTestDispatcher
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Test
import java.lang.reflect.Proxy

class DefaultStudentCalendarRepositoryTest {

    private val dispatcher = UnconfinedTestDispatcher()
    private var events: List<CalendarEventDto> = emptyList()
    private var fail: RuntimeException? = null
    private val calls = mutableListOf<List<Any?>>()

    private val api = Proxy.newProxyInstance(OrganisationApi::class.java.classLoader, arrayOf(OrganisationApi::class.java)) { _, method, args ->
        check(method.name == "studentCalendar") { "unexpected ${method.name}" }
        calls += args!!.dropLast(1).toList()
        fail?.let { throw it }
        ApiEnvelope(events)
    } as OrganisationApi

    private val repository = DefaultStudentCalendarRepository(api, ApiCaller(NetworkJson, dispatcher))

    @Test
    fun events_for_the_child_are_sorted_by_start_date() = runTest(dispatcher) {
        events = listOf(
            CalendarEventDto("e2", "sch", null, "VACATION", "Winter vacation", "2026-12-22", "2027-01-02", null),
            CalendarEventDto("e1", "sch", "b1", "HOLIDAY", "Founders' Day", "2026-10-20", "2026-10-20", "School closed"),
        )
        val result = repository.upcoming("c1", "2026-10-07", "2027-01-05")

        assertEquals(listOf(listOf<Any?>("c1", "2026-10-07", "2027-01-05")), calls)
        assertEquals(
            AppResult.Success(
                listOf(
                    CalendarEvent("e1", "HOLIDAY", "Founders' Day", "2026-10-20", "2026-10-20", "School closed"),
                    CalendarEvent("e2", "VACATION", "Winter vacation", "2026-12-22", "2027-01-02", null),
                ),
            ),
            result,
        )
    }

    @Test
    fun omitted_range_is_left_to_the_server_default() = runTest(dispatcher) {
        repository.upcoming("c1")
        assertEquals(listOf(listOf<Any?>("c1", null, null)), calls)
    }

    @Test
    fun missing_endpoint_maps_to_server_error() = runTest(dispatcher) {
        fail = httpError(404, "NOT_FOUND")
        assertEquals(AppResult.Failure(AppError.Server(404, "NOT_FOUND", "NOT_FOUND")), repository.upcoming("c1"))
    }
}
