package com.schoolapp.feature.messages

import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.model.ChildSummary
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.testing.FakeAuthRepository
import com.schoolapp.core.testing.MainDispatcherRule
import com.schoolapp.core.testing.TestSessions
import com.schoolapp.feature.messages.threads.ThreadsViewModel
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import java.time.LocalDateTime

class ThreadsViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val repository = FakeMessagesRepository()
    private val clock = AppClock { LocalDateTime.of(2026, 10, 6, 10, 0) }

    @Test
    fun parent_threads_follow_the_active_child() {
        val parent = TestSessions.session(RoleKey.PARENT, "messages.view").copy(
            children = listOf(ChildSummary("c1", "Ayesha"), ChildSummary("c2", "Bilal")),
            activeChildId = "c1",
        )
        val auth = FakeAuthRepository(parent)
        val vm = ThreadsViewModel(repository, auth, clock)

        assertTrue(vm.uiState.value.isParent)
        assertEquals(listOf("thread-c1"), vm.uiState.value.threads.map { it.id })

        auth.sessionState.value = parent.copy(activeChildId = "c2")

        assertEquals(listOf("c1", "c2"), repository.threadRequests)
        assertEquals("c2", vm.uiState.value.childId)
        assertEquals(listOf("thread-c2"), vm.uiState.value.threads.map { it.id })
    }

    @Test
    fun staff_see_all_own_threads_and_resume_refreshes() {
        val auth = FakeAuthRepository(TestSessions.session(RoleKey.TEACHER, "messages.view"))
        val vm = ThreadsViewModel(repository, auth, clock)

        assertFalse(vm.uiState.value.isParent)
        assertEquals(listOf<String?>(null), repository.threadRequests)

        vm.onResume()
        assertEquals(1, repository.threadRequests.size)
        vm.onResume()
        assertEquals(2, repository.threadRequests.size)
    }
}
