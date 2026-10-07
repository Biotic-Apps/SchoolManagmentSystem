package com.schoolapp.feature.auth

import androidx.lifecycle.SavedStateHandle
import com.schoolapp.core.common.result.AppError
import kotlinx.coroutines.CompletableDeferred
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

class TwoFactorStepTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val repository = FakeAuthRepository().apply { challengeId = "ch1" }
    private val handle = SavedStateHandle()
    private val viewModel = LoginViewModel(repository, handle)

    private fun reachCodeStep() {
        viewModel.onIdentifierChange("principal@school.pk")
        viewModel.onPasswordChange("secret")
        viewModel.onSubmit()
        assertEquals(LoginStep.TWO_FACTOR, viewModel.uiState.value.step)
    }

    private fun verify(code: String) {
        viewModel.onCodeChange(code)
        viewModel.onVerify()
    }

    @Test
    fun authenticator_code_must_be_six_digits() {
        reachCodeStep()
        verify("")
        assertEquals(TwoFactorFieldError.REQUIRED, viewModel.uiState.value.twoFactor.codeError)
        listOf("12345", "1234567", "12a456").forEach { code ->
            verify(code)
            assertEquals(code, TwoFactorFieldError.INVALID_TOTP, viewModel.uiState.value.twoFactor.codeError)
        }
        assertTrue(repository.verifyCalls.isEmpty())
    }

    @Test
    fun spaces_are_stripped_from_authenticator_code() {
        reachCodeStep()
        verify(" 123 456 ")
        assertNull(viewModel.uiState.value.twoFactor.codeError)
        assertEquals(listOf("ch1" to "123456"), repository.verifyCalls)
    }

    @Test
    fun recovery_code_mode_validates_shape_and_trims() {
        reachCodeStep()
        viewModel.onToggleCodeMode()
        assertEquals(TwoFactorMode.RECOVERY, viewModel.uiState.value.twoFactor.mode)
        listOf("abc-12", "ab cd-1234", "-abcd1234", "a".repeat(21)).forEach { code ->
            verify(code)
            assertEquals(code, TwoFactorFieldError.INVALID_RECOVERY, viewModel.uiState.value.twoFactor.codeError)
        }
        verify("  AB12-CD34  ")
        assertEquals(listOf("ch1" to "AB12-CD34"), repository.verifyCalls)
    }

    @Test
    fun toggling_mode_clears_code_error_and_failure() {
        reachCodeStep()
        verify("12")
        viewModel.onToggleCodeMode()
        val state = viewModel.uiState.value
        assertEquals(TwoFactorMode.RECOVERY, state.twoFactor.mode)
        assertEquals("", state.twoFactor.code)
        assertNull(state.twoFactor.codeError)

        repository.nextError = AppError.Unauthorized
        verify("ABCD-1234")
        assertEquals(LoginFailure.INVALID_CODE, viewModel.uiState.value.failure)
        viewModel.onToggleCodeMode()
        assertEquals(TwoFactorMode.AUTHENTICATOR, viewModel.uiState.value.twoFactor.mode)
        assertNull(viewModel.uiState.value.failure)
    }

    @Test
    fun verify_success_signs_in() {
        reachCodeStep()
        verify("123456")
        assertNotNull(repository.sessionState.value)
        assertFalse(viewModel.uiState.value.isSubmitting)
        assertNull(viewModel.uiState.value.failure)
    }

    @Test
    fun wrong_code_shows_invalid_code_and_stays_on_step() {
        reachCodeStep()
        listOf(AppError.Unauthorized, AppError.Validation("bad"), AppError.Server(400, null, null)).forEach { error ->
            repository.nextError = error
            verify("123456")
            val state = viewModel.uiState.value
            assertEquals(LoginFailure.INVALID_CODE, state.failure)
            assertEquals(LoginStep.TWO_FACTOR, state.step)
        }
    }

    @Test
    fun other_errors_map_to_existing_messages() {
        reachCodeStep()
        val cases = mapOf(
            AppError.Network to LoginFailure.NETWORK,
            AppError.Server(423, "ACCOUNT_LOCKED", null) to LoginFailure.LOCKED,
            AppError.Server(429, null, null) to LoginFailure.LOCKED,
            AppError.Server(500, null, null) to LoginFailure.SERVER,
        )
        cases.forEach { (error, expected) ->
            repository.nextError = error
            verify("123456")
            assertEquals(error.toString(), expected, viewModel.uiState.value.failure)
        }
    }

    @Test
    fun expired_challenge_returns_to_password_step() {
        listOf(AppError.Server(410, null, null), AppError.Server(400, "CHALLENGE_EXPIRED", null)).forEach { error ->
            repository.nextError = null
            reachCodeStep()
            repository.nextError = error
            verify("123456")
            val state = viewModel.uiState.value
            assertEquals(LoginStep.PASSWORD, state.step)
            assertEquals(LoginFailure.CHALLENGE_EXPIRED, state.failure)
            assertEquals("principal@school.pk", state.identifier)
            assertNull(handle.get<String>("twoFactorChallenge"))
        }
    }

    @Test
    fun back_to_sign_in_leaves_code_step() {
        reachCodeStep()
        viewModel.onBackToSignIn()
        assertEquals(LoginStep.PASSWORD, viewModel.uiState.value.step)
        assertEquals(LoginStep.PASSWORD, LoginViewModel(repository, handle).uiState.value.step)
    }

    @Test
    fun ignores_double_verify_while_running() {
        reachCodeStep()
        val gate = CompletableDeferred<Unit>()
        repository.gate = gate
        verify("123456")
        assertTrue(viewModel.uiState.value.isSubmitting)
        viewModel.onVerify()
        gate.complete(Unit)
        assertEquals(1, repository.verifyCalls.size)
    }

    @Test
    fun phone_sign_in_challenge_opens_the_shared_code_step() {
        viewModel.onTwoFactorChallenge("ch-phone")
        assertEquals(LoginStep.TWO_FACTOR, viewModel.uiState.value.step)
        verify("123456")
        assertEquals(listOf("ch-phone" to "123456"), repository.verifyCalls)
        assertTrue(repository.loginCalls.isEmpty())
    }

    @Test
    fun step_and_mode_survive_recreation() {
        reachCodeStep()
        viewModel.onToggleCodeMode()
        val restored = LoginViewModel(repository, handle)
        assertEquals(LoginStep.TWO_FACTOR, restored.uiState.value.step)
        assertEquals(TwoFactorMode.RECOVERY, restored.uiState.value.twoFactor.mode)
        restored.onCodeChange("ABCD-1234")
        restored.onVerify()
        assertEquals(listOf("ch1" to "ABCD-1234"), repository.verifyCalls)
    }
}
