package com.schoolapp.feature.activities.list

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.activities.ActivitiesRepository
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.SessionContext
import com.schoolapp.core.model.activity.ActivityStatus
import com.schoolapp.feature.activities.domain.ActivityTimes
import com.schoolapp.feature.activities.domain.ConsentRules
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.time.ZoneId
import javax.inject.Inject

/** Parents see the active child's activities (reloaded on child switch); staff see the branch's. */
@HiltViewModel
class ActivitiesListViewModel @Inject constructor(
    private val repository: ActivitiesRepository,
    private val authRepository: AuthRepository,
    private val clock: AppClock,
) : ViewModel() {

    private val _uiState = MutableStateFlow(ActivitiesListUiState())
    val uiState: StateFlow<ActivitiesListUiState> = _uiState.asStateFlow()

    private var childId: String? = null
    private var loadedOnce = false
    private var loadJob: Job? = null

    init {
        viewModelScope.launch {
            val session = authRepository.session.filterNotNull().first()
            if (session.activeRole == RoleKey.PARENT) {
                _uiState.update { it.copy(isParent = true) }
                authRepository.session.filterNotNull()
                    .map { it.activeChild?.id }
                    .distinctUntilChanged()
                    .collectLatest { id ->
                        childId = id
                        _uiState.update { it.copy(isLoading = true, upcoming = emptyList(), past = emptyList()) }
                        load(session)
                    }
            } else {
                load(session)
            }
        }
    }

    fun onTabSelected(tab: ActivitiesTab) = _uiState.update { it.copy(tab = tab) }

    fun retry() = reload(refreshing = false)

    fun refresh() = reload(refreshing = true)

    /** Called when the screen becomes visible again (e.g. back from propose or approve). */
    fun onResume() {
        if (loadedOnce) reload(refreshing = false, silent = true)
    }

    private fun reload(refreshing: Boolean, silent: Boolean = false) {
        loadJob?.cancel()
        loadJob = viewModelScope.launch {
            _uiState.update { it.copy(isRefreshing = refreshing, isLoading = !silent && !refreshing && it.visible.isEmpty(), error = null) }
            authRepository.session.first()?.let { load(it) }
        }
    }

    private suspend fun load(session: SessionContext) {
        val isParent = session.activeRole == RoleKey.PARENT
        val canApprove = session.has(APPROVE_PERMISSION)
        val canPropose = session.activeRole == RoleKey.TEACHER && session.has(ADD_PERMISSION)
        if (isParent && childId == null) {
            _uiState.update { it.copy(isLoading = false, isRefreshing = false, noChild = true, canPropose = false) }
            return
        }
        val result = if (isParent) repository.forChild(checkNotNull(childId)) else repository.activities(branchId = session.activeBranchId)
        when (result) {
            is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, isRefreshing = false, error = result.error) }
            is AppResult.Success -> {
                loadedOnce = true
                val now = clock.now()
                val zone = ZoneId.systemDefault()
                val items = result.data.map { ActivityItem(it, ActivityTimes.formatRange(it.startAt, it.endAt, zone), isParent && ConsentRules.needsResponse(it, now, zone)) }
                val (awaiting, rest) = if (canApprove) items.partition { it.activity.status == ActivityStatus.PROPOSED } else emptyList<ActivityItem>() to items
                val (upcoming, past) = rest.partition { ActivityTimes.isUpcoming(it.activity.startAt, it.activity.endAt, now, zone) }
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        isRefreshing = false,
                        error = null,
                        isParent = isParent,
                        noChild = false,
                        canPropose = canPropose,
                        awaitingApproval = awaiting.sortedBy { item -> item.startKey(zone) },
                        upcoming = upcoming.sortedBy { item -> item.startKey(zone) },
                        past = past.sortedByDescending { item -> item.startKey(zone) },
                    )
                }
            }
        }
    }

    private fun ActivityItem.startKey(zone: ZoneId) = ActivityTimes.toLocal(activity.startAt, zone)?.toString() ?: activity.startAt

    private companion object {
        const val APPROVE_PERMISSION = "activities.approve"
        const val ADD_PERMISSION = "activities.add"
    }
}
