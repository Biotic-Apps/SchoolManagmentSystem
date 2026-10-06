package com.schoolapp.feature.notices.compose

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.feature.notices.NoticeComposeResult

enum class AudienceMode { BRANCH, CLASSES, SECTIONS }

@Immutable
data class NoticeComposeUiState(
    val title: String = "",
    val body: String = "",
    val audience: AudienceMode = AudienceMode.BRANCH,
    val classes: List<SwitcherOption> = emptyList(),
    val sections: List<SwitcherOption> = emptyList(),
    val selectedClassIds: Set<String> = emptySet(),
    val selectedSectionIds: Set<String> = emptySet(),
    val optionsLoading: Boolean = true,
    val optionsError: AppError? = null,
    val expiresOn: String? = null,
    val pinned: Boolean = false,
    val today: String = "",
    val isPublishing: Boolean = false,
    val error: AppError? = null,
    val titleMissing: Boolean = false,
    val bodyMissing: Boolean = false,
    val audienceMissing: Boolean = false,
    val expiryInvalid: Boolean = false,
    val result: NoticeComposeResult? = null,
)
