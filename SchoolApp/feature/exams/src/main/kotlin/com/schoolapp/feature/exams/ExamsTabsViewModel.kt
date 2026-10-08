package com.schoolapp.feature.exams

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.data.auth.AuthRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import javax.inject.Inject

/** Staff exams menu: whether the "Class results" tab is shown (`exams.view`, same as the web). */
@HiltViewModel
class ExamsTabsViewModel @Inject constructor(
    authRepository: AuthRepository,
) : ViewModel() {
    val canViewResults: StateFlow<Boolean> = authRepository.session
        .map { session -> session != null && ExamPermissions.canView(session) }
        .stateIn(viewModelScope, SharingStarted.Eagerly, false)
}
