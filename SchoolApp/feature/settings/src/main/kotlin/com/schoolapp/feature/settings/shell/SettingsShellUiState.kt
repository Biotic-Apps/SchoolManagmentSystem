package com.schoolapp.feature.settings.shell

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.settings.NamedOption

@Immutable
internal data class SettingsShellUiState(
    val isLoading: Boolean = true,
    val error: AppError? = null,
    val schools: List<NamedOption> = emptyList(),
    val schoolId: String? = null,
    val tabs: List<SettingsTab> = listOf(SettingsTab.SCHOOL, SettingsTab.NOTIFICATIONS, SettingsTab.POLICIES),
    val tab: SettingsTab = SettingsTab.SCHOOL,
    /** `settings.edit` (the API also requires the super admin role for saving). */
    val canEdit: Boolean = false,
    val isSuperAdmin: Boolean = false,
) {
    val showSchoolPicker: Boolean get() = schools.size > 1
    val tabIndex: Int get() = tabs.indexOf(tab).coerceAtLeast(0)
}
