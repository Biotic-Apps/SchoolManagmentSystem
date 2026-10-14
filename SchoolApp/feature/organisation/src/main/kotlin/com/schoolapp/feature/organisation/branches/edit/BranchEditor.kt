package com.schoolapp.feature.organisation.branches.edit

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.common.toActionError
import com.schoolapp.core.data.organisation.OrganisationEditRepository
import com.schoolapp.core.model.organisation.Branch
import com.schoolapp.core.model.organisation.NamedOption
import com.schoolapp.feature.organisation.R
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/**
 * Add / edit branch, principal timings, archive / activate; settings and principal live in [tools].
 * Owned by a view model: call [attach] once with its scope and a reload callback.
 */
class BranchEditor @Inject constructor(
    private val repository: OrganisationEditRepository,
    private val authRepository: AuthRepository,
) {
    private val _state = MutableStateFlow(BranchEditorState())
    val state: StateFlow<BranchEditorState> = _state.asStateFlow()

    private lateinit var scope: CoroutineScope
    private var onSaved: () -> Unit = {}
    private var ownSchoolId: String? = null

    val tools = BranchToolsEditor(repository, _state, { scope }, { onSaved() })

    fun attach(scope: CoroutineScope, onSaved: () -> Unit) {
        this.scope = scope
        this.onSaved = onSaved
        scope.launch {
            val session = authRepository.session.filterNotNull().first()
            ownSchoolId = session.activeAssignments.firstNotNullOfOrNull { it.schoolId }
            _state.update { it.copy(perms = session.branchPermissions()) }
        }
    }

    fun dismissNotice() = _state.update { it.copy(notice = null) }

    fun dismissOpenError() = _state.update { it.copy(openError = null) }

    // --- Add / edit ------------------------------------------------------------------------------

    fun openAdd() {
        if (!_state.value.perms.canAdd) return
        scope.launch {
            val schools = if (_state.value.perms.canPickSchool) {
                when (val result = repository.schoolOptions()) {
                    is AppResult.Failure -> return@launch _state.update { it.copy(openError = result.error.toActionError()) }
                    is AppResult.Success -> result.data
                }
            } else {
                emptyList<NamedOption>()
            }
            _state.update { it.copy(form = BranchForm.create(schools, ownSchoolId), openError = null) }
        }
    }

    fun openEdit(branch: Branch) {
        val perms = _state.value.perms
        if (!perms.canEdit && !perms.canEditTimings) return
        _state.update { it.copy(form = BranchForm.edit(branch, timingsOnly = !perms.canEdit)) }
    }

    fun dismissForm() = _state.update { it.copy(form = null) }

    /** Applies [change] and clears the error shown on [field]. */
    fun editForm(field: BranchField?, change: (BranchForm) -> BranchForm) = _state.update { state ->
        state.copy(form = state.form?.let { form -> change(form).copy(errors = form.errors - setOfNotNull(field), error = null) })
    }

    fun saveForm() {
        val form = _state.value.form ?: return
        val errors = BranchFormRules.validate(form)
        if (errors.isNotEmpty()) return _state.update { it.copy(form = form.copy(errors = errors)) }
        _state.update { it.copy(form = form.copy(saving = true, error = null)) }
        scope.launch {
            val result = when {
                form.isNew -> repository.createBranch(form.details(), form.schedule())
                else -> repository.updateBranch(form.branchId.orEmpty(), form.details().takeUnless { form.timingsOnly }, form.schedule())
            }
            when (result) {
                is AppResult.Failure -> _state.update { it.copy(form = it.form?.copy(saving = false, error = result.error.toActionError())) }
                is AppResult.Success -> {
                    val notice = when {
                        form.isNew -> R.string.org_branch_created
                        form.timingsOnly -> R.string.org_timings_updated
                        else -> R.string.org_branch_updated
                    }
                    _state.update { it.copy(form = null, notice = notice) }
                    onSaved()
                }
            }
        }
    }

    // --- Archive / activate ----------------------------------------------------------------------

    fun askStatus(branch: Branch) = _state.update { it.copy(status = StatusChange(branch)) }

    fun dismissStatus() = _state.update { it.copy(status = null) }

    fun confirmStatus() {
        val change = _state.value.status ?: return
        _state.update { it.copy(status = change.copy(saving = true, error = null)) }
        scope.launch {
            when (val result = repository.setBranchActive(change.branch.id, active = !change.archiving)) {
                is AppResult.Failure -> _state.update { it.copy(status = it.status?.copy(saving = false, error = result.error.toActionError())) }
                is AppResult.Success -> {
                    val notice = if (change.archiving) R.string.org_branch_archived else R.string.org_branch_activated
                    _state.update { it.copy(status = null, notice = notice) }
                    onSaved()
                }
            }
        }
    }
}
