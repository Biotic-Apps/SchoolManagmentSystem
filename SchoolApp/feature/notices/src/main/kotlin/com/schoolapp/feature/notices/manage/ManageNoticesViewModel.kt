package com.schoolapp.feature.notices.manage

import androidx.compose.runtime.Immutable
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.notices.NoticesRepository
import com.schoolapp.core.model.notice.Notice
import com.schoolapp.core.model.notice.NoticeStatus
import com.schoolapp.feature.notices.NoticeComposeResult
import com.schoolapp.feature.notices.NoticeEvents
import com.schoolapp.feature.notices.NoticePermissions
import com.schoolapp.feature.notices.paging.NoticePage
import com.schoolapp.feature.notices.paging.NoticePager
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@Immutable
data class ManageNoticesUiState(
    val page: NoticePage = NoticePage(),
    val status: NoticeStatus? = null,
    val canPublish: Boolean = false,
    val publishingId: String? = null,
    val message: NoticeComposeResult? = null,
    val actionError: AppError? = null,
)

/** notices.add: every notice of the branch (drafts included), filtered by status; drafts can be published from the row. */
@HiltViewModel
class ManageNoticesViewModel @Inject constructor(
    private val repository: NoticesRepository,
    private val authRepository: AuthRepository,
    private val events: NoticeEvents,
) : ViewModel() {

    private val pager = NoticePager(repository, viewModelScope)
    private val extras = MutableStateFlow(ManageNoticesUiState())
    private var branchId: String? = null

    val uiState: StateFlow<ManageNoticesUiState> = combine(pager.state, extras) { page, extra -> extra.copy(page = page) }
        .stateIn(viewModelScope, SharingStarted.Eagerly, ManageNoticesUiState())

    init {
        viewModelScope.launch {
            authRepository.session.filterNotNull().map { it.activeBranchId to NoticePermissions.canPublish(it) }.distinctUntilChanged()
                .collect { (branch, canPublish) ->
                    branchId = branch
                    extras.update { it.copy(canPublish = canPublish) }
                    pager.reload(branch, extras.value.status)
                }
        }
        viewModelScope.launch {
            events.changes.collect { result ->
                extras.update { it.copy(message = result) }
                pager.refresh()
            }
        }
    }

    fun onStatusChange(status: NoticeStatus?) {
        if (status == extras.value.status) return
        extras.update { it.copy(status = status, message = null, actionError = null) }
        pager.reload(branchId, status)
    }

    fun refresh() = pager.refresh()

    fun loadMore() = pager.loadMore()

    fun onOpen(notice: Notice) = events.remember(notice)

    fun publish(notice: Notice) {
        if (extras.value.publishingId != null) return
        extras.update { it.copy(publishingId = notice.id, actionError = null, message = null) }
        viewModelScope.launch {
            when (val result = repository.publish(notice.id, notice)) {
                is AppResult.Failure -> extras.update { it.copy(publishingId = null, actionError = result.error) }
                is AppResult.Success -> {
                    extras.update { it.copy(publishingId = null) }
                    val outcome = if (result.data.status == NoticeStatus.PENDING_REVIEW) {
                        NoticeComposeResult.SENT_FOR_APPROVAL
                    } else {
                        NoticeComposeResult.PUBLISHED
                    }
                    events.post(outcome, result.data)
                }
            }
        }
    }
}
