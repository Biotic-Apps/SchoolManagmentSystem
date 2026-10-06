package com.schoolapp.feature.attendance.supervisor

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.attendance.AttendanceRepository
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.leave.LeaveRepository
import com.schoolapp.core.model.attendance.RegisterStatus
import com.schoolapp.core.model.attendance.SectionAttendance
import com.schoolapp.core.model.attendance.UnmarkedSection
import com.schoolapp.core.model.leave.LeaveScope
import com.schoolapp.core.model.leave.LeaveStatus
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.async
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Supervisor "Today": branch totals and per-section registers, sections not yet submitted first. */
@HiltViewModel
class BranchTodayViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    private val repository: AttendanceRepository,
    private val leaveRepository: LeaveRepository,
    clock: AppClock,
) : ViewModel() {

    private val today = clock.now().toLocalDate().toString()
    private val _uiState = MutableStateFlow(BranchTodayUiState(date = today, today = today))
    val uiState: StateFlow<BranchTodayUiState> = _uiState.asStateFlow()

    private var loadJob: Job? = null

    init {
        load()
    }

    fun onDateSelected(date: String) {
        if (date > today || date == _uiState.value.date) return
        _uiState.update { it.copy(date = date, rows = emptyList(), isLoading = true) }
        load()
    }

    fun refresh() {
        _uiState.update { it.copy(isRefreshing = true) }
        load()
    }

    fun load() {
        val date = _uiState.value.date
        _uiState.update { it.copy(isLoading = it.rows.isEmpty() && !it.isRefreshing, error = null) }
        loadJob?.cancel()
        loadJob = viewModelScope.launch {
            val branchId = authRepository.session.filterNotNull().first().activeBranchId
            val unmarked = async { repository.unmarked(branchId, date) }
            val leaves = async { leaveRepository.leaves(LeaveScope.REVIEW, LeaveStatus.SUBMITTED, branchId) }
            when (val summary = repository.branchSummary(branchId, date)) {
                is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, isRefreshing = false, error = summary.error) }
                is AppResult.Success -> {
                    val pending = (unmarked.await() as? AppResult.Success)?.data.orEmpty()
                    val rows = buildRows(summary.data, pending)
                    _uiState.update { it.copy(isLoading = false, isRefreshing = false, rows = rows, totals = totalsOf(rows)) }
                }
            }
            val pendingLeaves = (leaves.await() as? AppResult.Success)?.data?.size
            _uiState.update { it.copy(pendingLeaves = pendingLeaves) }
        }
    }

    internal companion object {
        /** Not-submitted sections first (including ones missing from the summary), then by class and section. */
        fun buildRows(summary: List<SectionAttendance>, unmarked: List<UnmarkedSection>): List<SectionSummaryRow> {
            val unmarkedIds = unmarked.map { it.sectionId }.toSet()
            val known = summary.map { it.sectionId }.toSet()
            val rows = summary.map {
                SectionSummaryRow(
                    sectionId = it.sectionId,
                    title = titleOf(it.className, it.sectionName),
                    status = it.status,
                    present = it.present,
                    absent = it.absent,
                    late = it.late,
                    leave = it.leave,
                    total = it.total,
                    notSubmitted = it.sectionId in unmarkedIds || it.status == RegisterStatus.UNMARKED,
                )
            } + unmarked.filterNot { it.sectionId in known }.map {
                SectionSummaryRow(it.sectionId, titleOf(it.className, it.sectionName), RegisterStatus.UNMARKED, 0, 0, 0, 0, 0, true)
            }
            return rows.sortedWith(compareBy({ !it.notSubmitted }, { it.title }))
        }

        fun totalsOf(rows: List<SectionSummaryRow>) = BranchTotals(
            present = rows.sumOf { it.present },
            absent = rows.sumOf { it.absent },
            late = rows.sumOf { it.late },
            leave = rows.sumOf { it.leave },
            unmarked = rows.sumOf { (it.total - it.present - it.absent - it.late - it.leave).coerceAtLeast(0) },
        )

        private fun titleOf(className: String?, sectionName: String?) = listOfNotNull(className, sectionName).joinToString(" - ")
    }
}
