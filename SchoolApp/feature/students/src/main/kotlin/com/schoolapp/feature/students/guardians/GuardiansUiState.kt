package com.schoolapp.feature.students.guardians

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.people.ChildLinkRequest
import com.schoolapp.core.model.people.Guardian

enum class GuardiansTab { LINK_REQUESTS, GUARDIANS }

@Immutable
data class GuardiansUiState(
    val tab: GuardiansTab = GuardiansTab.LINK_REQUESTS,
    val isLoading: Boolean = true,
    val requests: List<ChildLinkRequest> = emptyList(),
    val guardians: List<Guardian> = emptyList(),
    val query: String = "",
    val error: AppError? = null,
)
