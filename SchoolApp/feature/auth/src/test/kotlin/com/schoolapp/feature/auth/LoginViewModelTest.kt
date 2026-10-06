package com.schoolapp.feature.auth

import androidx.lifecycle.SavedStateHandle
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.data.auth.DefaultAuthRepository
import kotlinx.coroutines.CompletableDeferred
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

class LoginViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val repository = FakeAuthRepository()
    private val viewModel = LoginViewModel(repository, SavedStateHandle())

    private fun fill(identifier: String, password: String) {
        viewModel.onIdentifierChange(identifier)
        viewModel.onPasswordChange(password)
    }

    @Test
    fun empty_fields_show_required_errors_and_skip_login() {
        viewModel.onSubmit()
        val state = viewModel.uiState.value
        assertEquals(LoginFieldError.REQUIRED, state.identifierError)
        assertEquals(LoginFieldError.REQUIRED, state.passwordError)
        assertTrue(repository.loginCalls.isEmpty())
    }

    @Test
    fun malformed_email_is_rejected() {
        fill("teacher@school", "secret")
        viewModel.onSubmit()
        assertEquals(LoginFieldError.INVALID_EMAIL, viewModel.uiState.value.identifierError)
        assertTrue(repository.loginCalls.isEmpty())
    }

    @Test
    fun short_identifier_is_rejected() {
        fill("ab", "secret")
        viewModel.onSubmit()
        assertEquals(LoginFieldError.TOO_SHORT, viewModel.uiState.value.identifierError)
    }

    @Test
    fun phone_identifier_is_accepted() {
        fill("03001234567", "secret")
        viewModel.onSubmit()
        assertNull(viewModel.uiState.value.identifierError)
        assertEquals(listOf("03001234567" to "secret"), repository.loginCalls)
    }

    @Test
    fun editing_a_field_clears_its_error() {
        viewModel.onSubmit()
        viewModel.onIdentifierChange("teacher@school.pk")
        assertNull(viewModel.uiState.value.identifierError)
        assertEquals(LoginFieldError.REQUIRED, viewModel.uiState.value.passwordError)
    }

    @Test
    fun valid_input_trims_identifier_and_clears_password_on_success() {
        fill("  teacher@school.pk ", "secret")
        viewModel.onSubmit()
        assertEquals(listOf("teacher@school.pk" to "secret"), repository.loginCalls)
        val state = viewModel.uiState.value
        assertFalse(state.isSubmitting)
        assertEquals("", state.password)
        assertNull(state.failure)
    }

    @Test
    fun shows_loading_while_request_is_running_and_ignores_double_submit() {
        val gate = CompletableDeferred<Unit>()
        repository.gate = gate
        fill("teacher@school.pk", "secret")
        viewModel.onSubmit()
        assertTrue(viewModel.uiState.value.isSubmitting)
        viewModel.onSubmit()
        gate.complete(Unit)
        assertFalse(viewModel.uiState.value.isSubmitting)
        assertEquals(1, repository.loginCalls.size)
    }

    @Test
    fun maps_repository_errors_to_failures() {
        val cases = mapOf(
            AppError.Unauthorized to LoginFailure.INVALID_CREDENTIALS,
            AppError.Network to LoginFailure.NETWORK,
            AppError.Forbidden(DefaultAuthRepository.NO_ROLE) to LoginFailure.NO_ROLE,
            AppError.Forbidden("ACCOUNT_LOCKED") to LoginFailure.ACCESS_DENIED,
            AppError.Server(500, null, null) to LoginFailure.SERVER,
        )
        fill("teacher@school.pk", "secret")
        cases.forEach { (error, expected) ->
            repository.nextError = error
            viewModel.onSubmit()
            assertEquals(expected, viewModel.uiState.value.failure)
            assertFalse(viewModel.uiState.value.isSubmitting)
        }
    }

    @Test
    fun identifier_survives_process_death() {
        val handle = SavedStateHandle()
        LoginViewModel(repository, handle).onIdentifierChange("teacher@school.pk")
        assertEquals("teacher@school.pk", LoginViewModel(repository, handle).uiState.value.identifier)
    }

    @Test
    fun two_factor_required_moves_to_code_step_and_clears_password() {
        repository.challengeId = "ch1"
        fill("principal@school.pk", "secret")
        viewModel.onSubmit()
        val state = viewModel.uiState.value
        assertEquals(LoginStep.TWO_FACTOR, state.step)
        assertEquals(TwoFactorMode.AUTHENTICATOR, state.twoFactor.mode)
        assertEquals("", state.password)
        assertFalse(state.isSubmitting)
        assertNull(repository.sessionState.value)
    }
}
