package com.schoolapp.feature.auth

import androidx.lifecycle.SavedStateHandle
import com.schoolapp.core.common.result.AppError
import com.schoolapp.feature.auth.emailcode.EmailFieldError
import com.schoolapp.feature.auth.emailcode.EmailSignInViewModel
import com.schoolapp.feature.auth.emailcode.EmailStep
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.ExperimentalCoroutinesApi
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class EmailSignInViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val repository = FakeAuthRepository()
    private val handle = SavedStateHandle()
    private val viewModel = EmailSignInViewModel(repository, handle)

    private val state get() = viewModel.uiState.value

    private fun reachCodeStep(email: String = "parent@example.com") {
        viewModel.onStart()
        viewModel.onEmailChange(email)
        viewModel.onSendCode()
        assertEquals(EmailStep.CODE, state.step)
    }

    private fun advanceSeconds(seconds: Int) {
        mainDispatcherRule.dispatcher.scheduler.advanceTimeBy(seconds * 1_000L)
        mainDispatcherRule.dispatcher.scheduler.runCurrent()
    }

    @Test
    fun starts_inactive_and_toggles_with_password_sign_in() {
        assertFalse(state.active)
        viewModel.onStart()
        assertTrue(state.active)
        viewModel.onUsePassword()
        assertFalse(state.active)
    }

    @Test
    fun email_is_validated_before_any_request() {
        viewModel.onStart()
        viewModel.onSendCode()
        assertEquals(EmailFieldError.REQUIRED, state.emailError)
        listOf("parent", "parent@", "parent@example", "a b@example.com", "@example.com").forEach { email ->
            viewModel.onEmailChange(email)
            viewModel.onSendCode()
            assertEquals(email, EmailFieldError.INVALID_EMAIL, state.emailError)
        }
        assertTrue(repository.otpRequests.isEmpty())
    }

    @Test
    fun email_is_normalised_and_code_step_shown() {
        reachCodeStep("  Parent@Example.COM ")
        assertEquals(listOf("parent@example.com"), repository.otpRequests)
        assertEquals(60, state.resendInSeconds)
        assertFalse(state.isSubmitting)
    }

    @Test
    fun resend_is_blocked_until_the_countdown_ends() {
        repository.resendAfterSeconds = 3
        reachCodeStep()
        viewModel.onResend()
        assertEquals(1, repository.otpRequests.size)
        advanceSeconds(1)
        assertEquals(2, state.resendInSeconds)
        advanceSeconds(2)
        assertEquals(0, state.resendInSeconds)
        viewModel.onResend()
        assertEquals(2, repository.otpRequests.size)
        assertEquals(3, state.resendInSeconds)
    }

    @Test
    fun code_must_be_six_digits() {
        reachCodeStep()
        viewModel.onVerify()
        assertEquals(EmailFieldError.REQUIRED, state.codeError)
        listOf("12345", "1234567", "12a456").forEach { code ->
            viewModel.onCodeChange(code)
            viewModel.onVerify()
            assertEquals(code, EmailFieldError.INVALID_CODE, state.codeError)
        }
        assertTrue(repository.otpVerifyCalls.isEmpty())
    }

    @Test
    fun valid_code_signs_in_with_normalised_values() {
        reachCodeStep("Parent@Example.com")
        viewModel.onCodeChange(" 123 456 ")
        viewModel.onVerify()
        assertEquals(listOf("parent@example.com" to "123456"), repository.otpVerifyCalls)
        assertNotNull(repository.sessionState.value)
        assertNull(state.failure)
        assertEquals("", state.code)
    }

    @Test
    fun wrong_code_shows_invalid_or_expired_message() {
        reachCodeStep()
        repository.nextError = AppError.Unauthorized
        viewModel.onCodeChange("000000")
        viewModel.onVerify()
        assertEquals(LoginFailure.OTP_INVALID, state.failure)
        assertEquals(EmailStep.CODE, state.step)
    }

    @Test
    fun locked_account_is_reported() {
        reachCodeStep()
        repository.nextError = AppError.Server(423, "ACCOUNT_LOCKED", "Locked", null)
        viewModel.onCodeChange("000000")
        viewModel.onVerify()
        assertEquals(LoginFailure.LOCKED, state.failure)
    }

    @Test
    fun request_failure_keeps_the_email_step() {
        repository.nextError = AppError.Network
        viewModel.onStart()
        viewModel.onEmailChange("parent@example.com")
        viewModel.onSendCode()
        assertEquals(EmailStep.EMAIL, state.step)
        assertEquals(LoginFailure.NETWORK, state.failure)
    }

    @Test
    fun two_factor_challenge_is_handed_off_once() {
        repository.challengeId = "ch9"
        reachCodeStep()
        viewModel.onCodeChange("123456")
        viewModel.onVerify()
        assertEquals("ch9", state.pendingChallengeId)
        assertFalse(state.active)
        viewModel.onChallengeHandled()
        assertNull(state.pendingChallengeId)
    }

    @Test
    fun double_submit_sends_one_request() {
        val gate = CompletableDeferred<Unit>()
        repository.gate = gate
        viewModel.onStart()
        viewModel.onEmailChange("parent@example.com")
        viewModel.onSendCode()
        viewModel.onSendCode()
        assertTrue(state.isSubmitting)
        gate.complete(Unit)
        assertEquals(1, repository.otpRequests.size)
    }

    @Test
    fun back_goes_from_code_to_email_then_to_password() {
        reachCodeStep()
        viewModel.onBack()
        assertEquals(EmailStep.EMAIL, state.step)
        assertEquals(0, state.resendInSeconds)
        assertTrue(state.active)
        viewModel.onBack()
        assertFalse(state.active)
    }

    @Test
    fun step_and_email_survive_process_death() {
        reachCodeStep("parent@example.com")
        val restored = EmailSignInViewModel(repository, handle).uiState.value
        assertTrue(restored.active)
        assertEquals(EmailStep.CODE, restored.step)
        assertEquals("parent@example.com", restored.email)
    }
}
