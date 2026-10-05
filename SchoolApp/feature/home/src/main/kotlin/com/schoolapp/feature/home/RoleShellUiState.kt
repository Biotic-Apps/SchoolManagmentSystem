package com.schoolapp.feature.home

import androidx.compose.runtime.Immutable
import com.schoolapp.core.model.ChildSummary
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.RoleRef
import com.schoolapp.core.navigation.MenuItem

sealed interface RoleShellUiState {
    data object Loading : RoleShellUiState

    @Immutable
    data class Ready(
        val userName: String,
        val activeRole: RoleRef,
        val roles: List<RoleRef>,
        val roleNames: Map<String, String>,
        val menu: List<MenuItem>,
        val children: List<ChildSummary>,
        val activeChildId: String?,
        val unreadCount: Int = 0,
        val isSwitching: Boolean = false,
        val switchFailed: Boolean = false,
    ) : RoleShellUiState {
        val showChildSwitcher: Boolean get() = activeRole == RoleKey.PARENT && children.isNotEmpty()
        val showRoleSwitcher: Boolean get() = roles.size > 1
    }
}
