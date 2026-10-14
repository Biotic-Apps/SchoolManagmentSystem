package com.schoolapp.feature.activities.list.staff

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.activities.ActivitiesRepository
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.model.activity.Activity
import com.schoolapp.core.model.activity.ActivityFilter
import com.schoolapp.core.model.activity.ActivityStatus
import com.schoolapp.core.model.activity.ActivityType
import com.schoolapp.feature.activities.domain.ActivityTimes
import com.schoolapp.feature.activities.list.ActivityItem
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.time.LocalDate
import java.time.YearMonth
import java.time.ZoneId
import javax.inject.Inject

/** Staff: the branch's activities filtered by type / status, as a paged list or a month calendar. */
@HiltViewModel
class StaffActivitiesViewModel @Inject constructor(
    private val repository: ActivitiesRepository,
    private val authRepository: AuthRepository,
    private val clock: AppClock,
) : ViewModel() {

    val today: LocalDate get() = clock.now().toLocalDate()

    private val _uiState = MutableStateFlow(StaffActivitiesUiState(month = MonthState(YearMonth.from(clock.now()))))
    val uiState: StateFlow<StaffActivitiesUiState> = _uiState.asStateFlow()

    private var branchId: String? = null
    private var listJob: Job? = null
    private var monthJob: Job? = null
    private var loadedOnce = false

    init {
        viewModelScope.launch {
            authRepository.session.filterNotNull().map { it.activeBranchId to it.has(ADD_PERMISSION) }.distinctUntilChanged()
                .collect { (branch, canAdd) ->
                    branchId = branch
                    _uiState.update { it.copy(canPropose = canAdd && branch != null) }
                    reloadAll()
                }
        }
    }

    fun onTypeChange(type: ActivityType?) = setFilter(_uiState.value.filter.copy(type = type))

    fun onStatusChange(status: ActivityStatus?) = setFilter(_uiState.value.filter.copy(status = status))

    fun onViewChange(view: StaffView) {
        _uiState.update { it.copy(view = view) }
        if (view == StaffView.CALENDAR) loadMonth()
    }

    fun onMonthChange(delta: Long) {
        _uiState.update { it.copy(month = MonthState(it.month.month.plusMonths(delta))) }
        loadMonth()
    }

    fun onDaySelected(day: LocalDate) = _uiState.update { it.copy(month = it.month.copy(selectedDay = day)) }

    fun refresh() {
        loadList(refresh = true)
        if (_uiState.value.view == StaffView.CALENDAR) loadMonth()
    }

    fun onResume() {
        if (loadedOnce) refresh()
    }

    fun loadMore() {
        val list = _uiState.value.list
        if (!list.hasMore || list.isLoadingMore || list.isLoading) return
        _uiState.update { it.copy(list = it.list.copy(isLoadingMore = true, loadMoreError = null)) }
        val filter = _uiState.value.filter
        listJob = viewModelScope.launch {
            when (val result = repository.activitiesPage(branchId, filter, list.page + 1)) {
                is AppResult.Success -> _uiState.update { state ->
                    state.copy(
                        list = state.list.copy(
                            items = (state.list.items + result.data.items.map(::toItem)).distinctBy { it.activity.id },
                            page = result.data.page,
                            total = result.data.total,
                            isLoadingMore = false,
                        ),
                    )
                }
                is AppResult.Failure -> _uiState.update { it.copy(list = it.list.copy(isLoadingMore = false, loadMoreError = result.error)) }
            }
        }
    }

    fun loadMonth() {
        monthJob?.cancel()
        val state = _uiState.value
        _uiState.update { it.copy(month = it.month.copy(isLoading = true, error = null)) }
        monthJob = viewModelScope.launch {
            when (val result = MonthActivities.load(repository, branchId, state.filter, state.month.month)) {
                is AppResult.Success -> _uiState.update { s ->
                    val today = clock.now().toLocalDate()
                    val selected = s.month.selectedDay ?: today.takeIf { YearMonth.from(it) == s.month.month } ?: s.month.month.atDay(1)
                    s.copy(month = s.month.copy(byDay = result.data, isLoading = false, selectedDay = selected))
                }
                is AppResult.Failure -> _uiState.update { it.copy(month = it.month.copy(isLoading = false, error = result.error)) }
            }
        }
    }

    private fun setFilter(filter: ActivityFilter) {
        if (filter == _uiState.value.filter) return
        _uiState.update { it.copy(filter = filter) }
        reloadAll()
    }

    private fun reloadAll() {
        loadList(refresh = false)
        if (_uiState.value.view == StaffView.CALENDAR) loadMonth()
    }

    private fun loadList(refresh: Boolean) {
        listJob?.cancel()
        _uiState.update {
            val list = if (refresh && it.list.items.isNotEmpty()) it.list.copy(isRefreshing = true, error = null) else ActivityPageState()
            it.copy(list = list)
        }
        val filter = _uiState.value.filter
        listJob = viewModelScope.launch {
            when (val result = repository.activitiesPage(branchId, filter, page = 1)) {
                is AppResult.Success -> {
                    loadedOnce = true
                    _uiState.update {
                        it.copy(list = ActivityPageState(items = result.data.items.map(::toItem), page = 1, total = result.data.total, isLoading = false))
                    }
                }
                is AppResult.Failure -> _uiState.update { it.copy(list = it.list.copy(isLoading = false, isRefreshing = false, error = result.error)) }
            }
        }
    }

    private fun toItem(activity: Activity) =
        ActivityItem(activity, ActivityTimes.formatRange(activity.startAt, activity.endAt, ZoneId.systemDefault()))

    private companion object {
        const val ADD_PERMISSION = "activities.add"
    }
}
