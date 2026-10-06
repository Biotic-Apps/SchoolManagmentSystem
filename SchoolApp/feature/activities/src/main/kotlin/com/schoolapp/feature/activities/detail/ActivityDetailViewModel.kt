package com.schoolapp.feature.activities.detail

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.activities.ActivitiesRepository
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.designsystem.component.ApprovalAction
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.activity.Activity
import com.schoolapp.core.model.activity.ActivityStatus
import com.schoolapp.core.model.activity.ConsentStatus
import com.schoolapp.feature.activities.domain.ActivityTimes
import com.schoolapp.feature.activities.domain.ConsentRules
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** One activity: parents give consent, the principal approves proposals, staff see consents and participants. */
@HiltViewModel
class ActivityDetailViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val repository: ActivitiesRepository,
    private val authRepository: AuthRepository,
    private val clock: AppClock,
) : ViewModel() {

    private val activityId: String = checkNotNull(savedStateHandle["activityId"]) { "Activity id missing" }

    private val _uiState = MutableStateFlow(ActivityDetailUiState())
    val uiState: StateFlow<ActivityDetailUiState> = _uiState.asStateFlow()

    init {
        load()
    }

    fun load() {
        _uiState.update { it.copy(isLoading = it.activity == null, error = null) }
        viewModelScope.launch {
            val session = authRepository.session.filterNotNull().first()
            val isParent = session.activeRole == RoleKey.PARENT
            val childId = if (isParent) session.activeChild?.id else null
            when (val result = if (isParent && childId != null) parentActivity(childId) else repository.activity(activityId)) {
                is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, error = result.error) }
                is AppResult.Success -> {
                    val activity = result.data
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            isParent = isParent,
                            childId = childId,
                            myConsent = activity.myConsent,
                            canApprove = session.has(APPROVE_PERMISSION) && activity.status == ActivityStatus.PROPOSED,
                        ).withActivity(activity)
                    }
                    if (!isParent) loadStaffData(activity)
                }
            }
        }
    }

    fun onConsentNoteChange(note: String) = _uiState.update { it.copy(consentNote = note) }

    fun onApprovalCommentChange(comment: String) = _uiState.update { it.copy(approvalComment = comment) }

    fun decideConsent(decision: ConsentStatus) {
        val state = _uiState.value
        val childId = state.childId ?: return
        if (decision == ConsentStatus.PENDING || state.busyDecision != null) return
        val allowed = if (decision == ConsentStatus.GRANTED) state.showGrant else state.showDecline
        if (!allowed) return
        if (!ConsentRules.canRespond(state.activity?.consentDeadline, clock.now())) {
            _uiState.update { it.copy(consentOpen = false) }
            return
        }
        _uiState.update { it.copy(busyDecision = decision, actionError = null, message = null) }
        viewModelScope.launch {
            val note = state.consentNote.trim().ifEmpty { null }
            when (val result = repository.decideConsent(activityId, childId, decision, note)) {
                is AppResult.Failure -> _uiState.update { it.copy(busyDecision = null, actionError = result.error) }
                is AppResult.Success -> _uiState.update {
                    it.copy(busyDecision = null, myConsent = decision, consentNote = "", message = ActivityMessage.CONSENT_SAVED)
                }
            }
        }
    }

    fun approve() = decideProposal(ApprovalAction.Approve)

    fun reject() = decideProposal(ApprovalAction.Reject)

    private fun decideProposal(action: ApprovalAction) {
        val state = _uiState.value
        if (!state.canApprove || state.busyApproval != null) return
        _uiState.update { it.copy(busyApproval = action, actionError = null, message = null) }
        viewModelScope.launch {
            val comment = state.approvalComment.trim().ifEmpty { null }
            val result = if (action == ApprovalAction.Approve) repository.approve(activityId, comment) else repository.reject(activityId, comment)
            when (result) {
                is AppResult.Failure -> _uiState.update { it.copy(busyApproval = null, actionError = result.error) }
                is AppResult.Success -> _uiState.update {
                    it.copy(
                        busyApproval = null,
                        canApprove = false,
                        approvalComment = "",
                        message = if (action == ApprovalAction.Approve) ActivityMessage.APPROVED else ActivityMessage.REJECTED,
                    ).withActivity(result.data)
                }
            }
        }
    }

    /** `/activities/mine` carries the child's consent; fall back to the plain record if it is not listed. */
    private suspend fun parentActivity(childId: String): AppResult<Activity> {
        val listed = (repository.forChild(childId) as? AppResult.Success)?.data?.firstOrNull { it.id == activityId }
        return listed?.let { AppResult.Success(it) } ?: repository.activity(activityId)
    }

    private suspend fun loadStaffData(activity: Activity) {
        val consents = if (activity.consentRequired) repository.consents(activityId) else AppResult.Success(emptyList())
        val participants = repository.participants(activityId)
        _uiState.update {
            it.copy(
                consents = (consents as? AppResult.Success)?.data.orEmpty(),
                participants = (participants as? AppResult.Success)?.data.orEmpty(),
                staffDataError = (consents as? AppResult.Failure)?.error ?: (participants as? AppResult.Failure)?.error,
            )
        }
    }

    private fun ActivityDetailUiState.withActivity(activity: Activity) = copy(
        activity = activity,
        timeRange = ActivityTimes.formatRange(activity.startAt, activity.endAt),
        consentOpen = ConsentRules.canRespond(activity.consentDeadline, clock.now()),
    )

    private companion object {
        const val APPROVE_PERMISSION = "activities.approve"
    }
}
