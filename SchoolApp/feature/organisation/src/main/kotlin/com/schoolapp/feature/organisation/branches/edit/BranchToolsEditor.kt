package com.schoolapp.feature.organisation.branches.edit

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.common.toActionError
import com.schoolapp.core.data.organisation.OrganisationEditRepository
import com.schoolapp.core.model.organisation.Branch
import com.schoolapp.core.model.organisation.BranchSettingsValues
import com.schoolapp.feature.organisation.R
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

/** Branch settings and change-principal sheets; shares [BranchEditor]'s state. */
class BranchToolsEditor internal constructor(
    private val repository: OrganisationEditRepository,
    private val state: MutableStateFlow<BranchEditorState>,
    private val scope: () -> CoroutineScope,
    private val onSaved: () -> Unit,
) {
    // --- Settings --------------------------------------------------------------------------------

    fun openSettings(branch: Branch) {
        if (!state.value.perms.canEditSettings) return
        state.update { it.copy(settings = SettingsForm(branch.id, branch.name)) }
        loadSettings()
    }

    fun loadSettings() {
        val form = state.value.settings ?: return
        updateSettings { it.copy(loadError = null) }
        scope().launch {
            when (val result = repository.branchSettings(form.branchId)) {
                is AppResult.Failure -> updateSettings { it.copy(loadError = result.error) }
                is AppResult.Success -> updateSettings { it.copy(values = result.data) }
            }
        }
    }

    fun dismissSettings() = state.update { it.copy(settings = null) }

    fun editSettings(field: SettingsField?, change: (BranchSettingsValues) -> BranchSettingsValues) = updateSettings { form ->
        form.copy(values = form.values?.let(change), errors = form.errors - setOfNotNull(field), error = null)
    }

    fun saveSettings() {
        val form = state.value.settings ?: return
        val values = form.values ?: return
        val errors = buildMap {
            if (values.officeTo <= values.officeFrom) put(SettingsField.OFFICE_TO, R.string.org_office_hours_order)
            if (values.bankName.isNotBlank() && values.bankAccountNumber.isBlank()) {
                put(SettingsField.ACCOUNT_NUMBER, R.string.org_account_number_required)
            }
        }
        if (errors.isNotEmpty()) return updateSettings { it.copy(errors = errors) }
        updateSettings { it.copy(saving = true, error = null) }
        scope().launch {
            when (val result = repository.saveBranchSettings(form.branchId, values)) {
                is AppResult.Failure -> updateSettings { it.copy(saving = false, error = result.error.toActionError()) }
                is AppResult.Success -> {
                    state.update { it.copy(settings = null, notice = R.string.org_settings_saved) }
                    onSaved()
                }
            }
        }
    }

    // --- Principal -------------------------------------------------------------------------------

    fun openPrincipal(branch: Branch) {
        if (!state.value.perms.canChangePrincipal) return
        state.update { it.copy(principal = PrincipalForm(branch)) }
        loadPrincipals()
    }

    fun loadPrincipals() {
        if (state.value.principal == null) return
        updatePrincipal { it.copy(loadError = null) }
        scope().launch {
            when (val result = repository.principalOptions()) {
                is AppResult.Failure -> updatePrincipal { it.copy(loadError = result.error) }
                is AppResult.Success -> updatePrincipal { it.copy(options = result.data) }
            }
        }
    }

    fun dismissPrincipal() = state.update { it.copy(principal = null) }

    fun selectPrincipal(userId: String?) = updatePrincipal { it.copy(userId = userId, missing = false, error = null) }

    fun savePrincipal() {
        val form = state.value.principal ?: return
        val userId = form.userId ?: return updatePrincipal { it.copy(missing = true) }
        updatePrincipal { it.copy(saving = true, error = null) }
        scope().launch {
            when (val result = repository.changePrincipal(form.branch.id, userId)) {
                is AppResult.Failure -> updatePrincipal { it.copy(saving = false, error = result.error.toActionError()) }
                is AppResult.Success -> {
                    state.update { it.copy(principal = null, notice = R.string.org_principal_changed) }
                    onSaved()
                }
            }
        }
    }

    private fun updateSettings(change: (SettingsForm) -> SettingsForm) =
        state.update { it.copy(settings = it.settings?.let(change)) }

    private fun updatePrincipal(change: (PrincipalForm) -> PrincipalForm) =
        state.update { it.copy(principal = it.principal?.let(change)) }
}
