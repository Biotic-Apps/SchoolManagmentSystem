package com.schoolapp.feature.progress

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.model.ChildSummary
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.progress.HomeworkCompletionItem
import com.schoolapp.core.model.progress.HomeworkStatus
import com.schoolapp.core.testing.FakeAuthRepository
import com.schoolapp.core.testing.MainDispatcherRule
import com.schoolapp.core.testing.TestSessions
import com.schoolapp.feature.progress.parent.ChildHomeworkViewModel
import com.schoolapp.feature.progress.parent.HomeworkTally
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import java.time.LocalDateTime

class ChildHomeworkViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val clock = AppClock { LocalDateTime.of(2026, 10, 7, 9, 0) }
    private val progress = FakeProgressRepository().apply {
        completion = mapOf(
            "c1" to listOf(
                item("d3", "2026-10-07", null),
                item("d2", "2026-10-06", HomeworkStatus.PARTIAL),
                item("d1", "2026-10-05", HomeworkStatus.DONE),
            ),
            "c2" to listOf(item("d9", "2026-10-06", HomeworkStatus.NOT_DONE)),
        )
    }
    private val parent = FakeAuthRepository(
        TestSessions.session(RoleKey.PARENT, "progress.view").copy(
            children = listOf(ChildSummary("c1", "Ayesha Khan"), ChildSummary("c2", "Omar Khan")),
            activeChildId = "c1",
        ),
    )

    private fun item(id: String, date: String, status: HomeworkStatus?) =
        HomeworkCompletionItem(id, date, null, "Maths", "Exercise $id", status)

    @Test
    fun loads_the_last_30_days_for_the_active_child_with_a_tally() {
        val vm = ChildHomeworkViewModel(parent, progress, clock)
        val state = vm.uiState.value
        assertFalse(state.isLoading)
        assertEquals("Ayesha Khan", state.childName)
        assertEquals(listOf("d3", "d2", "d1"), state.items.map { it.id })
        assertEquals(HomeworkTally(total = 3, done = 1, partial = 1, notDone = 0, unchecked = 1), state.tally)
        assertEquals(listOf(Triple("c1", "2026-09-08", "2026-10-07")), progress.completionCalls)
    }

    @Test
    fun switching_child_reloads() = runTest {
        val vm = ChildHomeworkViewModel(parent, progress, clock)
        parent.selectChild("c2")
        val state = vm.uiState.value
        assertEquals("c2", state.childId)
        assertEquals(listOf("d9"), state.items.map { it.id })
        assertEquals(1, state.tally.notDone)
        assertEquals(listOf("c1", "c2"), progress.completionCalls.map { it.first })
    }

    @Test
    fun failure_shows_error_and_retry_recovers() {
        progress.completionError = AppError.Network
        val vm = ChildHomeworkViewModel(parent, progress, clock)
        assertEquals(AppError.Network, vm.uiState.value.error)

        progress.completionError = null
        vm.retry()
        assertNull(vm.uiState.value.error)
        assertEquals(3, vm.uiState.value.items.size)
    }

    @Test
    fun refresh_keeps_items_visible_and_clears_the_flag() {
        val vm = ChildHomeworkViewModel(parent, progress, clock)
        vm.refresh()
        assertFalse(vm.uiState.value.isRefreshing)
        assertEquals(3, vm.uiState.value.items.size)
        assertEquals(2, progress.completionCalls.size)
    }

    @Test
    fun no_child_linked_stops_loading_without_a_call() {
        val vm = ChildHomeworkViewModel(FakeAuthRepository(TestSessions.session(RoleKey.PARENT)), progress, clock)
        assertNull(vm.uiState.value.childId)
        assertFalse(vm.uiState.value.isLoading)
        assertTrue(progress.completionCalls.isEmpty())
    }
}
