package com.schoolapp

sealed interface AppUiState {
    data object Loading : AppUiState
    data object SignedOut : AppUiState
    data object PasswordChangeRequired : AppUiState
    data object SignedIn : AppUiState
}
