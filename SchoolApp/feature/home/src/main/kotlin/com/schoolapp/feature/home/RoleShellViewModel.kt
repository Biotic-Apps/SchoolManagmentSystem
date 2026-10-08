package com.schoolapp.feature.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.dispatcher.DefaultDispatcher
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.branding.BrandingRepository
import com.schoolapp.core.data.notifications.NotificationsRepository
import com.schoolapp.core.model.RoleRef
import com.schoolapp.core.model.SessionContext
import com.schoolapp.core.navigation.NavigationCatalog
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.flowOn
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.onStart
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class RoleShellViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    notificationsRepository: NotificationsRepository,
    private val brandingRepository: BrandingRepository,
    @DefaultDispatcher compute: CoroutineDispatcher,
) : ViewModel() {

    private val switchStatus = MutableStateFlow(SwitchStatus())

    val uiState: StateFlow<RoleShellUiState> = combine(
        authRepository.session.filterNotNull().map { it.toReady() }.flowOn(compute),
        notificationsRepository.unreadCount.onStart { emit(0) },
        switchStatus,
        brandingRepository.branding.map { it.toShellBrand() }.distinctUntilChanged().flowOn(compute),
    ) { ready, unread, status, brand ->
        ready.copy(unreadCount = unread, isSwitching = status.inProgress, switchFailed = status.failed, brand = brand)
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), RoleShellUiState.Loading)

    init {
        viewModelScope.launch {
            authRepository.session.filterNotNull()
                .map { it.activeRole to it.brandingSchoolId() }
                .distinctUntilChanged()
                .collectLatest { (_, schoolId) -> brandingRepository.refresh(schoolId) }
        }
    }

    fun onRoleSelected(role: RoleRef) {
        if (switchStatus.value.inProgress) return
        switchStatus.value = SwitchStatus(inProgress = true)
        viewModelScope.launch {
            val failed = authRepository.switchRole(role) is AppResult.Failure
            switchStatus.value = SwitchStatus(failed = failed)
        }
    }

    fun onSwitchErrorShown() {
        switchStatus.value = switchStatus.value.copy(failed = false)
    }

    fun onChildSelected(childId: String) {
        viewModelScope.launch { authRepository.selectChild(childId) }
    }

    fun onLogout() {
        viewModelScope.launch { authRepository.logout() }
    }

    private data class SwitchStatus(val inProgress: Boolean = false, val failed: Boolean = false)

    private fun SessionContext.toReady() = RoleShellUiState.Ready(
        userName = user.fullName,
        activeRole = activeRole,
        roles = availableRoles,
        roleNames = assignments.mapNotNull { a -> a.roleName?.let { a.role.key to it } }.toMap(),
        menu = NavigationCatalog.menuFor(this),
        children = children,
        activeChildId = activeChild?.id,
        branchName = activeAssignments.firstNotNullOfOrNull { it.branchName ?: it.schoolName },
    )
}
