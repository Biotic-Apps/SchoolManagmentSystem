package com.schoolapp.feature.exams

import androidx.compose.runtime.Immutable
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.data.auth.AuthRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import javax.inject.Inject

/** Which staff exam tabs the session may see. */
@Immutable
data class ExamTabsAccess(
    /** `exams.view`: class results, exams list, grading schemes, report card templates. */
    val canView: Boolean = false,
    /** Sets exams up (add / edit / approve / publish): exams, grading and template tabs. */
    val canManage: Boolean = false,
    /** `exams.approve`: end-of-session promotions. */
    val canPromote: Boolean = false,
)

@HiltViewModel
class ExamsTabsViewModel @Inject constructor(
    authRepository: AuthRepository,
) : ViewModel() {
    val access: StateFlow<ExamTabsAccess> = authRepository.session
        .map { session ->
            if (session == null) {
                ExamTabsAccess()
            } else {
                ExamTabsAccess(
                    canView = ExamPermissions.canView(session),
                    canManage = MANAGE.any { session.has(it) },
                    canPromote = session.has("exams.approve"),
                )
            }
        }
        .stateIn(viewModelScope, SharingStarted.Eagerly, ExamTabsAccess())

    private companion object {
        val MANAGE = listOf("exams.add", "exams.edit", "exams.approve", "exams.publish")
    }
}
