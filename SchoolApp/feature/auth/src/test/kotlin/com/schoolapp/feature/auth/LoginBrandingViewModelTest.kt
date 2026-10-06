package com.schoolapp.feature.auth

import app.cash.turbine.test
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.branding.BrandingRepository
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.branding.Branding
import com.schoolapp.feature.auth.branding.LoginBrandUiState
import com.schoolapp.feature.auth.branding.LoginBrandingViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotEquals
import org.junit.Assert.assertNull
import org.junit.Rule
import org.junit.Test

class LoginBrandingViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private class FakeBrandingRepository : BrandingRepository {
        override val branding = MutableStateFlow<Branding?>(null)
        val refreshes = mutableListOf<String?>()
        var result: AppResult<Unit> = AppResult.Success(Unit)

        override suspend fun refresh(schoolId: String?): AppResult<Unit> {
            refreshes += schoolId
            return result
        }
    }

    private val repository = FakeBrandingRepository()

    @Test
    fun refreshes_default_school_once_and_keeps_defaults_on_failure() = runTest {
        repository.result = AppResult.Failure(AppError.Network)
        val viewModel = LoginBrandingViewModel(repository)
        viewModel.uiState.test {
            assertEquals(LoginBrandUiState(), awaitItem())
        }
        assertEquals(listOf<String?>(null), repository.refreshes)
    }

    @Test
    fun maps_app_name_logo_and_safe_colour() = runTest {
        val viewModel = LoginBrandingViewModel(repository)
        viewModel.uiState.test {
            awaitItem()
            repository.branding.value = Branding("Green Valley School", "GV Connect", "https://x/logo.png", "#0B5D3B", null)
            val state = awaitItem()
            assertEquals("GV Connect", state.name)
            assertEquals("https://x/logo.png", state.logoUrl)
            assertNotEquals(AppColors.Primary, state.color)
        }
    }

    @Test
    fun falls_back_to_school_name_and_token_colour() = runTest {
        val viewModel = LoginBrandingViewModel(repository)
        viewModel.uiState.test {
            awaitItem()
            repository.branding.value = Branding("Green Valley School", " ", "", "#FFFF00", null)
            val state = awaitItem()
            assertEquals("Green Valley School", state.name)
            assertNull(state.logoUrl)
            assertEquals(AppColors.Primary, state.color)
        }
    }
}
