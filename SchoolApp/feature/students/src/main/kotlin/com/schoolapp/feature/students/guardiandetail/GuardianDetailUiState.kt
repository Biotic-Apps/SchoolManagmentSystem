package com.schoolapp.feature.students.guardiandetail

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.data.common.ActionError
import com.schoolapp.core.model.admissions.ParentLogin
import com.schoolapp.core.model.guardians.GuardianChild
import com.schoolapp.core.model.guardians.GuardianDetail
import com.schoolapp.core.ui.people.FormErrors
import com.schoolapp.core.ui.people.GuardianForm

enum class SignInAction { CREATE, RESET }

/** The one open sheet on the guardian page. */
sealed interface GuardianSheet {
    @Immutable
    data class Edit(
        val form: GuardianForm,
        val saving: Boolean = false,
        val errors: FormErrors = FormErrors(),
        val error: ActionError? = null,
    ) : GuardianSheet

    /** Unlink a child: the reason (3+ characters) is kept in the audit trail. */
    @Immutable
    data class Unlink(
        val child: GuardianChild,
        val reason: String = "",
        val reasonError: Boolean = false,
        val saving: Boolean = false,
        val error: ActionError? = null,
    ) : GuardianSheet
}

sealed interface GuardianNotice {
    data object Saved : GuardianNotice
    data object Unlinked : GuardianNotice
    data class Sent(val channels: List<String>) : GuardianNotice
}

/** A one-time sign-in to show after creating or resetting (Copy / Share). */
@Immutable
data class RevealedLogin(val title: SignInAction, val login: ParentLogin, val admissionNo: String?)

@Immutable
data class GuardianDetailUiState(
    val isLoading: Boolean = true,
    val error: AppError? = null,
    val detail: GuardianDetail? = null,
    /** `guardians.edit`: edit, unlink, give sign-in, send steps. */
    val canEdit: Boolean = false,
    /** Also `users.edit`: make a new temporary password. */
    val canReset: Boolean = false,
    val sheet: GuardianSheet? = null,
    val confirm: SignInAction? = null,
    val confirming: Boolean = false,
    val sending: Boolean = false,
    val actionError: ActionError? = null,
    val revealed: RevealedLogin? = null,
    val notice: GuardianNotice? = null,
) {
    /** The child whose admission number is the parent's username. */
    val usernameChild: GuardianChild?
        get() = detail?.children?.firstOrNull { it.status == "VERIFIED" && it.admissionNo != null }
            ?: detail?.children?.firstOrNull { it.admissionNo != null && it.isActiveLink }
}
