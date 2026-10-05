package com.schoolapp.feature.profile

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.testing.FakeAuthRepository
import com.schoolapp.core.testing.MainDispatcherRule
import com.schoolapp.feature.profile.password.ChangePasswordViewModel
import com.schoolapp.feature.profile.password.PasswordFieldError
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

class ChangePasswordViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val auth = FakeAuthRepository()
    private val viewModel = ChangePasswordViewModel(auth)

    private fun fill(current: String, new: String, confirm: String = new) {
        viewModel.onCurrentChange(current)
        viewModel.onNewChange(new)
        viewModel.onConfirmChange(confirm)
    }

    @Test
    fun empty_form_shows_required_errors() {
        viewModel.onSubmit()
        val state = viewModel.uiState.value
        assertEquals(PasswordFieldError.REQUIRED, state.currentError)
        assertEquals(PasswordFieldError.REQUIRED, state.newError)
        assertEquals(PasswordFieldError.REQUIRED, state.confirmError)
        assertTrue(auth.changePasswordCalls.isEmpty())
    }

    @Test
    fun enforces_contract_password_rules() {
        val cases = mapOf(
            "short1" to PasswordFieldError.TOO_SHORT,
            "lettersonly" to PasswordFieldError.NEEDS_LETTER_AND_DIGIT,
            "12345678" to PasswordFieldError.NEEDS_LETTER_AND_DIGIT,
            "Demo@1234" to PasswordFieldError.SAME_AS_CURRENT,
        )
        cases.forEach { (candidate, expected) ->
            fill("Demo@1234", candidate)
            viewModel.onSubmit()
            assertEquals(candidate, expected, viewModel.uiState.value.newError)
        }
        assertTrue(auth.changePasswordCalls.isEmpty())
    }

    @Test
    fun confirmation_must_match() {
        fill("Demo@1234", "NewPass123", "NewPass124")
        viewModel.onSubmit()
        assertEquals(PasswordFieldError.MISMATCH, viewModel.uiState.value.confirmError)
    }

    @Test
    fun valid_change_calls_server_and_completes() {
        fill("Demo@1234", "NewPass123")
        viewModel.onSubmit()
        assertEquals(listOf("Demo@1234" to "NewPass123"), auth.changePasswordCalls)
        val state = viewModel.uiState.value
        assertTrue(state.done)
        assertEquals("", state.new)
    }

    @Test
    fun wrong_current_password_is_shown_on_the_field() {
        auth.nextError = AppError.Unauthorized
        fill("Wrong1234", "NewPass123")
        viewModel.onSubmit()
        assertEquals(PasswordFieldError.WRONG_CURRENT, viewModel.uiState.value.currentError)
        assertNull(viewModel.uiState.value.failure)
    }

    @Test
    fun network_failure_is_reported_generally() {
        auth.nextError = AppError.Network
        fill("Demo@1234", "NewPass123")
        viewModel.onSubmit()
        assertEquals(AppError.Network, viewModel.uiState.value.failure)
    }
}
