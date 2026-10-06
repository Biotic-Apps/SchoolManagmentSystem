package com.schoolapp.feature.auth.branding

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.data.branding.BrandingRepository
import com.schoolapp.core.designsystem.brand.BrandColor
import com.schoolapp.core.model.branding.Branding
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

/** School name, logo and colour for the sign-in screens; falls back to the design tokens when unknown. */
@HiltViewModel
class LoginBrandingViewModel @Inject constructor(
    private val brandingRepository: BrandingRepository,
) : ViewModel() {

    val uiState: StateFlow<LoginBrandUiState> = brandingRepository.branding
        .map { it?.toUiState() ?: LoginBrandUiState() }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(STOP_TIMEOUT_MS), LoginBrandUiState())

    init {
        // A failed refresh keeps the cached (or default) branding.
        viewModelScope.launch { brandingRepository.refresh(schoolId = null) }
    }

    private fun Branding.toUiState() = LoginBrandUiState(
        name = appName?.takeIf { it.isNotBlank() } ?: schoolName?.takeIf { it.isNotBlank() },
        logoUrl = logoUrl?.takeIf { it.isNotBlank() },
        color = BrandColor.primaryOrDefault(primaryColor),
    )

    private companion object {
        const val STOP_TIMEOUT_MS = 5_000L
    }
}
