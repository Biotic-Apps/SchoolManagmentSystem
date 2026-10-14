package com.schoolapp.feature.fees.staff.structure

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.fees.scope.FinanceBranch
import com.schoolapp.core.data.fees.structure.FeeStructureRepository
import com.schoolapp.core.data.organisation.OrganisationRepository
import com.schoolapp.core.model.fees.structure.FeeHeadInput
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.async
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Fee heads of the branch's school, fee plans of one session, and sibling discount rules. */
@HiltViewModel
class FeeStructureViewModel @Inject constructor(
    private val repository: FeeStructureRepository,
    private val organisation: OrganisationRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(FeeStructureUiState())
    val uiState: StateFlow<FeeStructureUiState> = _uiState.asStateFlow()

    private var branch: FinanceBranch? = null

    fun start(branch: FinanceBranch) {
        if (this.branch?.id == branch.id) return
        this.branch = branch
        load(refreshing = false)
    }

    fun refresh() = load(refreshing = true)

    fun retry() = load(refreshing = false)

    fun onSession(sessionId: String) {
        if (sessionId == _uiState.value.sessionId) return
        _uiState.update { it.copy(sessionId = sessionId) }
        loadPlans()
    }

    fun reloadPlans() = loadPlans()

    // Fee heads
    fun openHeadForm() = _uiState.update { it.copy(headForm = HeadForm(), notice = null) }

    fun dismissHeadForm() = _uiState.update { if (it.headForm?.isSaving == true) it else it.copy(headForm = null) }

    fun editHead(change: (HeadForm) -> HeadForm) = _uiState.update { state ->
        val form = state.headForm?.let(change) ?: return@update state
        state.copy(headForm = if (form.issues.isEmpty()) form else form.copy(issues = form.validate()))
    }

    fun saveHead() {
        val form = _uiState.value.headForm ?: return
        val schoolId = branch?.schoolId ?: return
        if (form.isSaving) return
        val issues = form.validate()
        if (issues.isNotEmpty()) return _uiState.update { it.copy(headForm = form.copy(issues = issues)) }
        _uiState.update { it.copy(headForm = form.copy(isSaving = true, error = null)) }
        viewModelScope.launch {
            when (val result = repository.createFeeHead(FeeHeadInput(schoolId, form.code, form.name, form.kind, form.refundable))) {
                is AppResult.Success -> _uiState.update {
                    it.copy(headForm = null, heads = (it.heads + result.data).sortedBy { head -> head.name }, notice = StructureNotice.HEAD_ADDED)
                }
                is AppResult.Failure -> _uiState.update { it.copy(headForm = it.headForm?.copy(isSaving = false, error = result.error)) }
            }
        }
    }

    // Sibling discounts
    fun openSiblingForm(editing: com.schoolapp.core.model.fees.structure.SiblingDiscount? = null) = _uiState.update { state ->
        val next = (2..20).firstOrNull { index -> state.discounts.none { it.childIndex == index } } ?: 2
        val form = editing?.let { SiblingForm(it, it.childIndex, it.percentOff.toString()) } ?: SiblingForm(childIndex = next)
        state.copy(siblingForm = form, notice = null)
    }

    fun dismissSiblingForm() = _uiState.update { if (it.siblingForm?.isSaving == true) it else it.copy(siblingForm = null) }

    fun editSibling(change: (SiblingForm) -> SiblingForm) = _uiState.update { state ->
        state.copy(siblingForm = state.siblingForm?.let(change)?.copy(percentInvalid = false, childTaken = false))
    }

    fun saveSibling() {
        val state = _uiState.value
        val form = state.siblingForm ?: return
        val schoolId = branch?.schoolId ?: return
        if (form.isSaving) return
        val percent = form.percentValue()
        val taken = form.editing == null && state.discounts.any { it.childIndex == form.childIndex }
        if (percent == null || taken) {
            return _uiState.update { it.copy(siblingForm = form.copy(percentInvalid = percent == null, childTaken = taken)) }
        }
        _uiState.update { it.copy(siblingForm = form.copy(isSaving = true, error = null)) }
        viewModelScope.launch {
            val editing = form.editing
            val result = if (editing == null) {
                repository.addSiblingDiscount(schoolId, form.childIndex, percent)
            } else {
                repository.updateSiblingDiscount(editing.id, percent)
            }
            when (result) {
                is AppResult.Success -> {
                    val notice = if (editing == null) StructureNotice.SIBLING_ADDED else StructureNotice.SIBLING_UPDATED
                    _uiState.update { it.copy(siblingForm = null, notice = notice) }
                    loadDiscounts()
                }
                is AppResult.Failure -> _uiState.update { it.copy(siblingForm = it.siblingForm?.copy(isSaving = false, error = result.error)) }
            }
        }
    }

    // Confirmed actions
    fun ask(confirm: StructureConfirm) = _uiState.update { it.copy(confirm = confirm, notice = null, actionError = null) }

    fun dismissConfirm() = _uiState.update { it.copy(confirm = null) }

    fun confirm() {
        val confirm = _uiState.value.confirm ?: return
        _uiState.update { it.copy(confirm = null, busy = true, actionError = null) }
        viewModelScope.launch {
            val (result, notice) = when (confirm) {
                is StructureConfirm.Approve -> repository.approveFeePlan(confirm.plan.id) to StructureNotice.PLAN_APPROVED
                is StructureConfirm.Archive -> repository.archiveFeePlan(confirm.plan.id) to StructureNotice.PLAN_ARCHIVED
                is StructureConfirm.DeleteSibling -> repository.deleteSiblingDiscount(confirm.discount.id) to StructureNotice.SIBLING_REMOVED
            }
            when (result) {
                is AppResult.Success -> {
                    _uiState.update { it.copy(busy = false, notice = notice) }
                    if (confirm is StructureConfirm.DeleteSibling) loadDiscounts() else loadPlans()
                }
                is AppResult.Failure -> _uiState.update { it.copy(busy = false, actionError = result.error) }
            }
        }
    }

    private fun load(refreshing: Boolean) {
        val current = branch ?: return
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = !refreshing, isRefreshing = refreshing, error = null) }
            val heads = async { repository.feeHeads(current.schoolId) }
            val sessions = async { organisation.sessions(current.id) }
            val discounts = async { repository.siblingDiscounts(current.schoolId) }
            val headsResult = heads.await()
            val sessionsResult = sessions.await()
            val discountsResult = discounts.await()
            val failure = listOf(headsResult, sessionsResult, discountsResult).filterIsInstance<AppResult.Failure>().firstOrNull()
            _uiState.update { state ->
                val list = (sessionsResult as? AppResult.Success)?.data.orEmpty()
                val sessionId = state.sessionId?.takeIf { id -> list.any { it.id == id } }
                    ?: (list.firstOrNull { it.isActive } ?: list.firstOrNull())?.id
                state.copy(
                    isLoading = false,
                    isRefreshing = false,
                    error = failure?.error,
                    heads = (headsResult as? AppResult.Success)?.data?.sortedBy { it.name } ?: state.heads,
                    sessions = list,
                    sessionId = sessionId,
                    discounts = (discountsResult as? AppResult.Success)?.data ?: state.discounts,
                )
            }
            loadPlans()
        }
    }

    private fun loadPlans() {
        val current = branch ?: return
        val sessionId = _uiState.value.sessionId ?: return _uiState.update { it.copy(plans = emptyList()) }
        viewModelScope.launch {
            _uiState.update { it.copy(plansLoading = true, plansError = null) }
            val result = repository.feePlans(current.id, sessionId)
            _uiState.update { state ->
                if (state.sessionId != sessionId) return@update state
                when (result) {
                    is AppResult.Success -> state.copy(plansLoading = false, plans = result.data)
                    is AppResult.Failure -> state.copy(plansLoading = false, plansError = result.error)
                }
            }
        }
    }

    private fun loadDiscounts() {
        val current = branch ?: return
        viewModelScope.launch {
            (repository.siblingDiscounts(current.schoolId) as? AppResult.Success)?.let { result ->
                _uiState.update { it.copy(discounts = result.data) }
            }
        }
    }
}
