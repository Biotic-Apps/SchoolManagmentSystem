package com.schoolapp.feature.auth

import androidx.lifecycle.SavedStateHandle
import com.schoolapp.core.common.result.AppError
import com.schoolapp.feature.auth.reset.ResetFailure
import com.schoolapp.feature.auth.reset.ResetFieldError
import com.schoolapp.feature.auth.reset.ResetPasswordViewModel
import kotlinx.coroutines.CompletableDeferred
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

class ResetPasswordViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val repository = FakeAuthRepository()
    private val handle = SavedStateHandle()
    private val viewModel = ResetPasswordViewModel(repository, handle)

    private fun fill(token: String, new: String, confirm: String = new) {
        viewModel.onTokenChange(token)
        viewModel.onNewChange(new)
        viewModel.onConfirmChange(confirm)
    }

    @Test
    fun all_fields_are_required() {
        viewModel.onSubmit()
        val state = viewModel.uiState.value
        assertEquals(ResetFieldError.REQUIRED, state.tokenError)
        assertEquals(ResetFieldError.REQUIRED, state.newError)
        assertEquals(ResetFieldError.REQUIRED, state.confirmError)
        fill("   ", "secret123")
        viewModel.onSubmit()
        assertEquals(ResetFieldError.REQUIRED, viewModel.uiState.value.tokenError)
        assertTrue(repository.resetCalls.isEmpty())
    }

    @Test
    fun new_password_follows_the_password_rules() {
        fill("token", "abc12")
        viewModel.onSubmit()
        assertEquals(ResetFieldError.TOO_SHORT, viewModel.uiState.value.newError)
        fill("token", "abcdefgh")
        viewModel.onSubmit()
        assertEquals(ResetFieldError.NEEDS_LETTER_AND_DIGIT, viewModel.uiState.value.newError)
        assertTrue(repository.resetCalls.isEmpty())
    }

    @Test
    fun confirmation_must_match() {
        fill("token", "secret123", "secret124")
        viewModel.onSubmit()
        assertEquals(ResetFieldError.MISMATCH, viewModel.uiState.value.confirmError)
        assertNull(viewModel.uiState.value.newError)
        assertTrue(repository.resetCalls.isEmpty())
    }

    @Test
    fun success_trims_token_and_shows_done() {
        fill("  tok-123  ", "secret123")
        viewModel.onSubmit()
        assertEquals(listOf("tok-123" to "secret123"), repository.resetCalls)
        val state = viewModel.uiState.value
        assertTrue(state.done)
        assertEquals("", state.newPassword)
        assertTrue(ResetPasswordViewModel(repository, handle).uiState.value.done)
    }

    @Test
    fun rejected_token_shows_invalid_code() {
        listOf(AppError.Validation("Invalid token"), AppError.Server(400, null, null)).forEach { error ->
            repository.nextError = error
            fill("token", "secret123")
            viewModel.onSubmit()
            val state = viewModel.uiState.value
            assertEquals(ResetFailure.InvalidCode, state.failure)
            assertFalse(state.done)
            assertFalse(state.isSubmitting)
        }
    }

    @Test
    fun network_error_is_shown_and_editing_clears_it() {
        repository.nextError = AppError.Network
        fill("token", "secret123")
        viewModel.onSubmit()
        assertEquals(ResetFailure.Error(AppError.Network), viewModel.uiState.value.failure)
        viewModel.onTokenChange("token2")
        assertNull(viewModel.uiState.value.failure)
    }

    @Test
    fun ignores_double_submit() {
        val gate = CompletableDeferred<Unit>()
        repository.gate = gate
        fill("token", "secret123")
        viewModel.onSubmit()
        viewModel.onSubmit()
        gate.complete(Unit)
        viewModel.onSubmit()
        assertEquals(1, repository.resetCalls.size)
    }
}
