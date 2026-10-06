package com.schoolapp.startup

import com.schoolapp.AppUiState
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class SplashGateTest {

    @Test
    fun `splash stays while the session check is running`() {
        assertTrue(SplashGate.keepOnScreen(AppUiState.Loading))
    }

    @Test
    fun `splash leaves as soon as any session outcome is known`() {
        listOf(AppUiState.SignedOut, AppUiState.SignedIn, AppUiState.PasswordChangeRequired).forEach {
            assertFalse(it.toString(), SplashGate.keepOnScreen(it))
        }
    }
}
