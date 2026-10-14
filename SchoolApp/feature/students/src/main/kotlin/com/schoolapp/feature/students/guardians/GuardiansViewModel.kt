package com.schoolapp.feature.students.guardians

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.common.toActionError
import com.schoolapp.core.data.guardians.GuardianAdminRepository
import com.schoolapp.core.model.people.ChildLinkRequest
import com.schoolapp.core.model.people.Guardian
import com.schoolapp.feature.students.paging.Pager
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.FlowPreview
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.debounce
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.drop
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Parents & Guardians: link requests decided in place, a paged guardian directory and bulk login slips. */
@OptIn(FlowPreview::class)
@HiltViewModel
class GuardiansViewModel @Inject constructor(
    private val repository: GuardianAdminRepository,
    authRepository: AuthRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(GuardiansUiState())
    val uiState: StateFlow<GuardiansUiState> = _uiState.asStateFlow()

    val requests = Pager<ChildLinkRequest>(viewModelScope) { page -> repository.linkRequests(page) }
    val guardians = Pager<Guardian>(viewModelScope) { page -> repository.guardians(_uiState.value.query, page) }

    init {
        requests.reload()
        guardians.reload()
        viewModelScope.launch {
            val session = authRepository.session.filterNotNull().first()
            val canEdit = session.has(GUARDIANS_EDIT)
            _uiState.update { it.copy(canDecide = canEdit, canPrintSlips = canEdit && session.has(USERS_EDIT)) }
        }
        viewModelScope.launch {
            _uiState.map { it.query.trim() }.distinctUntilChanged().drop(1).debounce(SEARCH_DEBOUNCE_MS).collect { guardians.reload() }
        }
    }

    fun onTabSelected(tab: GuardiansTab) = _uiState.update { it.copy(tab = tab) }

    fun onQueryChange(query: String) = _uiState.update { it.copy(query = query) }

    fun refresh() = when (_uiState.value.tab) {
        GuardiansTab.LINK_REQUESTS -> requests.refresh()
        GuardiansTab.GUARDIANS -> guardians.refresh()
    }

    fun approve(request: ChildLinkRequest) = decide(request, approve = true, reason = null)

    fun startReject(request: ChildLinkRequest) = _uiState.update { it.copy(rejecting = request, rejectReason = "", actionError = null) }

    fun onRejectReason(reason: String) = _uiState.update { it.copy(rejectReason = reason) }

    fun dismissReject() = _uiState.update { it.copy(rejecting = null) }

    fun confirmReject() {
        val request = _uiState.value.rejecting ?: return
        decide(request, approve = false, reason = _uiState.value.rejectReason)
    }

    fun dismissError() = _uiState.update { it.copy(actionError = null) }

    fun noticeShown() = _uiState.update { it.copy(notice = null) }

    fun showLoginSlips(show: Boolean) = _uiState.update { it.copy(showLoginSlips = show) }

    private fun decide(request: ChildLinkRequest, approve: Boolean, reason: String?) {
        if (request.id in _uiState.value.deciding) return
        _uiState.update { it.copy(deciding = it.deciding + request.id, actionError = null) }
        viewModelScope.launch {
            val result = if (approve) repository.approveLink(request.id) else repository.rejectLink(request.id, reason)
            when (result) {
                is AppResult.Success -> {
                    requests.edit { rows -> rows.filterNot { it.id == request.id } }
                    _uiState.update {
                        it.copy(
                            deciding = it.deciding - request.id,
                            rejecting = null,
                            notice = if (approve) GuardiansNotice.APPROVED else GuardiansNotice.REJECTED,
                        )
                    }
                    // A newly verified link can give the guardian a sign-in; refresh the directory quietly.
                    if (approve) guardians.refresh()
                }
                is AppResult.Failure -> _uiState.update {
                    it.copy(deciding = it.deciding - request.id, actionError = result.error.toActionError())
                }
            }
        }
    }

    private companion object {
        const val SEARCH_DEBOUNCE_MS = 350L
        const val GUARDIANS_EDIT = "guardians.edit"
        const val USERS_EDIT = "users.edit"
    }
}
