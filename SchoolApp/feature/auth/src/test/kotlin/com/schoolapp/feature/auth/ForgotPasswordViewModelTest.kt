package com.schoolapp.feature.auth

import androidx.lifecycle.SavedStateHandle
import com.schoolapp.core.common.result.AppError
import com.schoolapp.feature.auth.forgot.ForgotPasswordViewModel
import kotlinx.coroutines.CompletableDeferred
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

class ForgotPasswordViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val repository = FakeAuthRepository()
    private val handle = SavedStateHandle()
    private val viewModel = ForgotPasswordViewModel(repository, handle)

    private fun submit(identifier: String) {
        viewModel.onIdentifierChange(identifier)
        viewModel.onSubmit()
    }

    @Test
    fun identifier_is_validated_before_sending() {
        submit("")
        assertEquals(LoginFieldError.REQUIRED, viewModel.uiState.value.identifierError)
        submit("teacher@school")
        assertEquals(LoginFieldError.INVALID_EMAIL, viewModel.uiState.value.identifierError)
        submit("ab")
        assertEquals(LoginFieldError.TOO_SHORT, viewModel.uiState.value.identifierError)
        assertTrue(repository.resetRequests.isEmpty())
    }

    @Test
    fun success_shows_neutral_message_with_trimmed_identifier() {
        submit("  teacher@school.pk ")
        val state = viewModel.uiState.value
        assertTrue(state.sent)
        assertNull(state.failure)
        assertFalse(state.isSubmitting)
        assertEquals(listOf("teacher@school.pk"), repository.resetRequests)
    }

    @Test
    fun account_related_errors_still_show_the_neutral_message() {
        listOf(
            AppError.Server(404, "NOT_FOUND", null),
            AppError.Validation("Unknown account"),
            AppError.Server(429, "RATE_LIMITED", null),
            AppError.Forbidden("ACCOUNT_DISABLED"),
        ).forEach { error ->
            repository.nextError = error
            val vm = ForgotPasswordViewModel(repository, SavedStateHandle())
            vm.onIdentifierChange("03001234567")
            vm.onSubmit()
            assertTrue(error.toString(), vm.uiState.value.sent)
            assertNull(vm.uiState.value.failure)
        }
    }

    @Test
    fun network_and_server_faults_are_shown() {
        listOf(AppError.Network, AppError.Server(503, null, null)).forEach { error ->
            repository.nextError = error
            val vm = ForgotPasswordViewModel(repository, SavedStateHandle())
            vm.onIdentifierChange("teacher@school.pk")
            vm.onSubmit()
            assertFalse(vm.uiState.value.sent)
            assertEquals(error, vm.uiState.value.failure)
        }
    }

    @Test
    fun ignores_double_submit_while_sending() {
        val gate = CompletableDeferred<Unit>()
        repository.gate = gate
        submit("teacher@school.pk")
        assertTrue(viewModel.uiState.value.isSubmitting)
        viewModel.onSubmit()
        gate.complete(Unit)
        viewModel.onSubmit()
        assertEquals(1, repository.resetRequests.size)
    }

    @Test
    fun sent_state_survives_recreation() {
        submit("teacher@school.pk")
        val restored = ForgotPasswordViewModel(repository, handle).uiState.value
        assertTrue(restored.sent)
        assertEquals("teacher@school.pk", restored.identifier)
    }
}
