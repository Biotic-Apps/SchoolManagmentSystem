package com.schoolapp.core.data.progress

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.fakes.httpError
import com.schoolapp.core.model.progress.HomeworkCompletionItem
import com.schoolapp.core.model.progress.HomeworkStatus
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.NetworkJson
import com.schoolapp.core.network.api.ProgressApi
import com.schoolapp.core.network.model.ApiEnvelope
import kotlinx.coroutines.test.UnconfinedTestDispatcher
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Test
import java.lang.reflect.Proxy

class HomeworkCompletionRepositoryTest {

    private val dispatcher = UnconfinedTestDispatcher()
    private var body: String = "[]"
    private var fail: RuntimeException? = null
    private val calls = mutableListOf<List<Any?>>()

    private val api = Proxy.newProxyInstance(ProgressApi::class.java.classLoader, arrayOf(ProgressApi::class.java)) { _, method, args ->
        check(method.name == "homeworkCompletion") { "unexpected ${method.name}" }
        calls += args!!.dropLast(1).toList()
        fail?.let { throw it }
        ApiEnvelope(NetworkJson.parseToJsonElement(body))
    } as ProgressApi

    private val repository = DefaultProgressRepository(api, ApiCaller(NetworkJson, dispatcher), NetworkJson)

    @Test
    fun reads_the_wrapped_entries_newest_first_with_ticks() = runTest(dispatcher) {
        body = """
            {"studentId":"c1","from":"2026-09-08","to":"2026-10-07","summary":{"total":3},
             "entries":[
               {"diaryEntryId":"d1","date":"2026-10-05","dueDate":null,"subject":{"id":"m","name":"Maths"},"homework":" Ex 4.2 ","status":"DONE"},
               {"diaryEntryId":"d2","date":"2026-10-07","dueDate":"2026-10-08","subject":{"id":"e","name":"English"},"homework":"Read ch 3","status":null},
               {"diaryEntryId":"d3","date":"2026-10-06","subject":{"id":"s","name":""},"subjectName":"Science","homework":"Worksheet","status":"WEIRD"}
             ]}
        """.trimIndent()

        val result = repository.homeworkCompletion("c1", "2026-09-08", "2026-10-07")

        assertEquals(listOf(listOf<Any?>("c1", "2026-09-08", "2026-10-07")), calls)
        val items = (result as AppResult.Success).data
        assertEquals(listOf("d2", "d3", "d1"), items.map { it.id })
        assertEquals(HomeworkCompletionItem("d1", "2026-10-05", null, "Maths", "Ex 4.2", HomeworkStatus.DONE), items[2])
        assertEquals("Science", items[1].subjectName)
        assertEquals(listOf(null, null, HomeworkStatus.DONE), items.map { it.status })
    }

    @Test
    fun accepts_a_plain_array_and_drops_blank_homework() = runTest(dispatcher) {
        body = """[{"date":"2026-10-06","homework":"Copy poem"},{"date":"2026-10-06","homework":"  "}]"""
        val items = (repository.homeworkCompletion("c1") as AppResult.Success).data
        assertEquals(listOf("2026-10-06:0"), items.map { it.id })
    }

    @Test
    fun missing_endpoint_maps_to_server_error() = runTest(dispatcher) {
        fail = httpError(404, "NOT_FOUND")
        assertEquals(AppResult.Failure(AppError.Server(404, "NOT_FOUND", "NOT_FOUND")), repository.homeworkCompletion("c1"))
    }
}
