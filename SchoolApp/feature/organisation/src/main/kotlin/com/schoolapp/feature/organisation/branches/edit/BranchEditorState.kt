package com.schoolapp.feature.organisation.branches.edit

import androidx.annotation.StringRes
import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.data.common.ActionError
import com.schoolapp.core.model.organisation.Branch
import com.schoolapp.core.model.organisation.BranchSettingsValues
import com.schoolapp.core.model.organisation.NamedOption

enum class SettingsField { LOCK, DIARY_CLOSE, OFFICE_TO, ACCOUNT_NUMBER, CHALLAN_NOTE }

/** Branch settings sheet: loads the current values first ([values] null while loading or after [loadError]). */
@Immutable
data class SettingsForm(
    val branchId: String,
    val branchName: String,
    val values: BranchSettingsValues? = null,
    val loadError: AppError? = null,
    val errors: Map<SettingsField, Int> = emptyMap(),
    val saving: Boolean = false,
    val error: ActionError? = null,
)

/** Change principal sheet; [options] are active users holding the Principal role. */
@Immutable
data class PrincipalForm(
    val branch: Branch,
    val options: List<NamedOption>? = null,
    val loadError: AppError? = null,
    val userId: String? = branch.principalId,
    val missing: Boolean = false,
    val saving: Boolean = false,
    val error: ActionError? = null,
)

/** Archive (active branch) or activate (archived branch) confirmation. */
@Immutable
data class StatusChange(val branch: Branch, val saving: Boolean = false, val error: ActionError? = null) {
    val archiving: Boolean get() = branch.status == "ACTIVE"
}

@Immutable
data class BranchEditorState(
    val perms: BranchPermissions = BranchPermissions(),
    val form: BranchForm? = null,
    val settings: SettingsForm? = null,
    val principal: PrincipalForm? = null,
    val status: StatusChange? = null,
    /** Shown when opening the add form failed (schools could not load). */
    val openError: ActionError? = null,
    @StringRes val notice: Int? = null,
)
