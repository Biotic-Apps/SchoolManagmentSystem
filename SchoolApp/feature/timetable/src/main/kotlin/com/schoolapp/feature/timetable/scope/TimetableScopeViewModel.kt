package com.schoolapp.feature.timetable.scope

import androidx.compose.runtime.Immutable
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.designsystem.component.SwitcherOption
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** [branchId] null until resolved; [options] has more than one entry only for multi-branch (global) roles. */
@Immutable
data class TimetableScopeState(
    val ready: Boolean = false,
    val branchId: String? = null,
    val options: List<SwitcherOption> = emptyList(),
)

/** Drives the branch bar above the timetable tabs; the tabs are rebuilt (keyed) whenever the branch changes. */
@HiltViewModel
class TimetableScopeViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    private val scope: TimetableBranchScope,
) : ViewModel() {

    private val _state = MutableStateFlow(TimetableScopeState())
    val state: StateFlow<TimetableScopeState> = _state.asStateFlow()

    init {
        viewModelScope.launch {
            val session = authRepository.session.filterNotNull().first()
            val branch = (scope.branchId(session) as? AppResult.Success)?.data
            _state.update { TimetableScopeState(ready = true, branchId = branch, options = scope.options(session)) }
        }
    }

    fun select(branchId: String) {
        if (branchId == _state.value.branchId) return
        viewModelScope.launch {
            scope.select(authRepository.session.filterNotNull().first(), branchId)
            _state.update { it.copy(branchId = branchId) }
        }
    }
}
