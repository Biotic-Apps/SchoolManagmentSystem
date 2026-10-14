package com.schoolapp.feature.profile

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.profile.twofactor.TwoFactorRepository
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.profile.TwoFactorSetup
import com.schoolapp.core.model.profile.TwoFactorStatus
import com.schoolapp.core.testing.FakeAuthRepository
import com.schoolapp.core.testing.MainDispatcherRule
import com.schoolapp.core.testing.TestSessions
import com.schoolapp.feature.profile.twofactor.CodeFieldError
import com.schoolapp.feature.profile.twofactor.TwoFactorDialogKind
import com.schoolapp.feature.profile.twofactor.TwoFactorViewModel
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

class TwoFactorViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val repo = FakeTwoFactorRepository()
    private val viewModel by lazy {
        TwoFactorViewModel(repo, FakeAuthRepository(TestSessions.session(RoleKey.PRINCIPAL, "profile.view")))
    }

    @Test
    fun loads_status() {
        repo.status = TwoFactorStatus(enabled = false, required = true)
        val state = viewModel.uiState.value
        assertFalse(state.isLoading)
        assertTrue(state.required)
    }

    @Test
    fun short_code_is_rejected_locally() {
        viewModel.onStartSetup()
        viewModel.onCodeChange("12a3")
        viewModel.onEnable()
        assertEquals(CodeFieldError.REQUIRED_TOTP, viewModel.uiState.value.codeError)
        assertNull(repo.enabledWith)
    }

    @Test
    fun enabling_shows_recovery_codes() {
        viewModel.onStartSetup()
        viewModel.onCodeChange("123 456")
        viewModel.onEnable()
        val state = viewModel.uiState.value
        assertEquals("123456", repo.enabledWith)
        assertTrue(state.enabled)
        assertEquals(listOf("aaaaa-bbbbb"), state.recoveryCodes)
        assertNull(state.setup)
    }

    @Test
    fun wrong_code_maps_to_inline_error() {
        repo.failure = AppError.Unauthorized
        viewModel.onStartSetup()
        viewModel.onCodeChange("123456")
        viewModel.onEnable()
        assertEquals(CodeFieldError.WRONG, viewModel.uiState.value.codeError)
    }

    @Test
    fun disabling_needs_password_and_confirmation() {
        repo.status = TwoFactorStatus(enabled = true, required = false)
        viewModel.openDialog(TwoFactorDialogKind.DISABLE)
        viewModel.onDialogCodeChange("123456")
        viewModel.onDialogSubmit()
        assertTrue(viewModel.uiState.value.dialog!!.passwordMissing)
        viewModel.onDialogPasswordChange("secret1")
        viewModel.onDialogSubmit()
        assertTrue(viewModel.uiState.value.dialog!!.confirming)
        viewModel.onDialogConfirm()
        assertFalse(viewModel.uiState.value.enabled)
        assertNull(viewModel.uiState.value.dialog)
    }
}

private class FakeTwoFactorRepository : TwoFactorRepository {
    var status = TwoFactorStatus(enabled = false, required = false)
    var failure: AppError? = null
    var enabledWith: String? = null

    override suspend fun status(): AppResult<TwoFactorStatus> = AppResult.Success(status)

    override suspend fun startSetup(): AppResult<TwoFactorSetup> =
        AppResult.Success(TwoFactorSetup("otpauth://totp/eSchool:sara?secret=ABCD", "ABCDEFGH"))

    override suspend fun enable(code: String): AppResult<List<String>> {
        failure?.let { return AppResult.Failure(it) }
        enabledWith = code
        return AppResult.Success(listOf("aaaaa-bbbbb"))
    }

    override suspend fun disable(password: String, code: String): AppResult<Unit> =
        failure?.let { AppResult.Failure(it) } ?: AppResult.Success(Unit)

    override suspend fun regenerateRecoveryCodes(code: String): AppResult<List<String>> =
        failure?.let { AppResult.Failure(it) } ?: AppResult.Success(listOf("ccccc-ddddd"))
}
