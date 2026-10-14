package com.schoolapp.feature.students.guardians

import androidx.compose.runtime.Immutable
import com.schoolapp.core.data.common.ActionError
import com.schoolapp.core.model.people.ChildLinkRequest

enum class GuardiansTab { LINK_REQUESTS, GUARDIANS }

/** Shell-level state of Parents & Guardians; the two lists live in their own [com.schoolapp.feature.students.paging.Pager]s. */
@Immutable
data class GuardiansUiState(
    val tab: GuardiansTab = GuardiansTab.LINK_REQUESTS,
    val query: String = "",
    /** `guardians.edit`: approve/reject link requests. */
    val canDecide: Boolean = false,
    /** `guardians.edit` + `users.edit`: bulk parent login slips. */
    val canPrintSlips: Boolean = false,
    /** Requests with an approve/reject in flight. */
    val deciding: Set<String> = emptySet(),
    /** The request being rejected (reason sheet open). */
    val rejecting: ChildLinkRequest? = null,
    val rejectReason: String = "",
    val actionError: ActionError? = null,
    val notice: GuardiansNotice? = null,
    val showLoginSlips: Boolean = false,
)

enum class GuardiansNotice { APPROVED, REJECTED }
