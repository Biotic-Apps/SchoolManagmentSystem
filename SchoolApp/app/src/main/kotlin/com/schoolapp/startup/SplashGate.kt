package com.schoolapp.startup

import com.schoolapp.AppUiState

/** The splash stays only while the stored session is being read; no artificial delay. */
internal object SplashGate {
    fun keepOnScreen(state: AppUiState): Boolean = state == AppUiState.Loading
}
