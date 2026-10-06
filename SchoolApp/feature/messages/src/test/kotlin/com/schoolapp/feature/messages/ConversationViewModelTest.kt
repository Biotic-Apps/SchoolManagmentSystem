package com.schoolapp.feature.messages

import androidx.lifecycle.SavedStateHandle
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.testing.FakeAuthRepository
import com.schoolapp.core.testing.MainDispatcherRule
import com.schoolapp.core.testing.TestSessions
import com.schoolapp.feature.messages.conversation.ConversationViewModel
import kotlinx.coroutines.CompletableDeferred
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import java.time.LocalDateTime

class ConversationViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val repository = FakeMessagesRepository()
    private val files = FakeFilesRepository()
    private val auth = FakeAuthRepository(TestSessions.session(RoleKey.TEACHER, "messages.view"))
    private val clock = AppClock { LocalDateTime.of(2026, 10, 6, 10, 0) }

    private fun viewModel() = ConversationViewModel(SavedStateHandle(mapOf("threadId" to "t1")), repository, files, auth, clock)

    @Test
    fun opening_loads_history_and_marks_read() {
        val vm = viewModel()
        assertEquals(listOf("m1"), vm.uiState.value.messages.map { it.id })
        assertEquals("u1", vm.uiState.value.myUserId)
        assertEquals(1, repository.markReadCalls)
    }

    @Test
    fun optimistic_send_shows_sending_bubble_then_replaces_it_with_server_message() {
        val gate = CompletableDeferred<Unit>()
        repository.sendGate = gate
        val vm = viewModel()
        vm.onDraftChange("  See you tomorrow ")
        vm.send()

        val sending = vm.uiState.value
        assertEquals("", sending.draft)
        assertEquals("See you tomorrow", sending.pending.single().body)
        assertFalse(sending.pending.single().failed)
        assertEquals(listOf("m1"), sending.messages.map { it.id })

        gate.complete(Unit)
        val sent = vm.uiState.value
        assertTrue(sent.pending.isEmpty())
        assertEquals(listOf("m1", "server-1"), sent.messages.map { it.id })
        assertTrue(sent.silentIds.isEmpty())
    }

    @Test
    fun failed_send_is_marked_and_retry_resends_same_content() {
        repository.sendError = AppError.Network
        val vm = viewModel()
        vm.onAttach("content://pic")
        vm.onDraftChange("Report card")
        vm.send()

        val failed = vm.uiState.value.pending.single()
        assertTrue(failed.failed)
        assertEquals(listOf("f-content://pic"), failed.attachments.map { it.id })

        repository.sendError = null
        repository.silent = true
        vm.retry(failed.tempId)

        val state = vm.uiState.value
        assertTrue(state.pending.isEmpty())
        assertEquals(2, repository.sends.size)
        assertEquals(repository.sends[0], repository.sends[1])
        assertEquals("Report card" to listOf("f-content://pic"), repository.sends[1])
        assertEquals(setOf("server-2"), state.silentIds)
    }

    @Test
    fun blank_draft_is_not_sent() {
        val vm = viewModel()
        vm.onDraftChange("   ")
        vm.send()
        assertTrue(vm.uiState.value.pending.isEmpty())
        assertTrue(repository.sends.isEmpty())
    }
}
