package com.schoolapp.feature.notices.feed

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.notices.NoticesRepository
import com.schoolapp.core.model.notice.Notice
import com.schoolapp.core.model.notice.NoticeStatus
import com.schoolapp.feature.notices.NoticeEvents
import com.schoolapp.feature.notices.NoticePermissions
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

/** Published notices addressed to the user (server order: pinned first), paged; opening one marks it read. */
@HiltViewModel
class NoticesFeedViewModel @Inject constructor(
    private val repository: NoticesRepository,
    private val authRepository: AuthRepository,
    private val events: NoticeEvents,
) : ViewModel() {

    private val pager = NoticePager(repository, viewModelScope)
    private val extras = MutableStateFlow(NoticesFeedUiState())

    val uiState: StateFlow<NoticesFeedUiState> = combine(pager.state, extras) { page, extra -> extra.copy(page = page) }
        .stateIn(viewModelScope, SharingStarted.Eagerly, NoticesFeedUiState())

    private var branchId: String? = null

    init {
        viewModelScope.launch {
            authRepository.session.filterNotNull().map { Triple(it.activeRole, it.activeBranchId, NoticePermissions.canAdd(it)) }
                .distinctUntilChanged()
                .collect { (_, branch, canAdd) ->
                    branchId = branch
                    extras.update { it.copy(canAdd = canAdd) }
                    pager.reload(branch, NoticeStatus.PUBLISHED)
                }
        }
        viewModelScope.launch {
            events.changes.collect { result ->
                extras.update { it.copy(message = result) }
                pager.refresh()
            }
        }
    }

    fun refresh() = pager.refresh()

    fun loadMore() = pager.loadMore()

    fun onOpen(id: String): Notice? {
        val notice = pager.state.value.items.firstOrNull { it.id == id } ?: return null
        val read = notice.copy(isRead = true)
        events.remember(read)
        if (!notice.isRead) {
            pager.update { it.replace(read) }
            viewModelScope.launch { repository.markRead(id) }
        }
        return read
    }

    fun onMessageShown() = extras.update { it.copy(message = null) }
}
