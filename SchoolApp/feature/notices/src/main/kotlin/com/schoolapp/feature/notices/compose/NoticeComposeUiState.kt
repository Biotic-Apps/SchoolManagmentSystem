package com.schoolapp.feature.notices.compose

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.model.files.AttachmentDraft
import com.schoolapp.core.model.notice.NoticeAudience
import com.schoolapp.core.model.notice.NoticeInput
import com.schoolapp.feature.notices.NoticeComposeResult

enum class ComposeAction { DRAFT, PUBLISH }

@Immutable
data class AudienceOptions(
    val branches: List<SwitcherOption> = emptyList(),
    val classes: List<SwitcherOption> = emptyList(),
    val sections: List<SwitcherOption> = emptyList(),
) {
    private val names: Map<String, String> by lazy { (branches + classes + sections).associate { it.id to it.label } }

    fun nameOf(id: String): String? = names[id]
}

@Immutable
data class NoticeComposeUiState(
    val editingId: String? = null,
    val draftMissing: Boolean = false,
    val title: String = "",
    val body: String = "",
    val audience: NoticeAudience = NoticeAudience(),
    val options: AudienceOptions = AudienceOptions(),
    val optionsLoading: Boolean = true,
    val optionsError: AppError? = null,
    val attachments: AttachmentDraft = AttachmentDraft(),
    val expiresOn: String? = null,
    val pinned: Boolean = false,
    val today: String = "",
    val saving: ComposeAction? = null,
    val error: AppError? = null,
    val publishFailedAfterSave: Boolean = false,
    val titleMissing: Boolean = false,
    val bodyMissing: Boolean = false,
    val audienceMissing: Boolean = false,
    val expiryInvalid: Boolean = false,
    val result: NoticeComposeResult? = null,
) {
    val isSaving: Boolean get() = saving != null

    val hasErrors: Boolean get() = titleMissing || bodyMissing || audienceMissing || expiryInvalid

    /** School-wide sends only the flags; otherwise the chosen branches / classes / sections. */
    fun toInput(): NoticeInput = NoticeInput(
        title = title.trim(),
        body = body.trim(),
        audience = if (audience.schoolWide) NoticeAudience(schoolWide = true, staffOnly = audience.staffOnly) else audience,
        attachmentFileIds = attachments.fileIds,
        expiresOn = expiresOn,
        pinned = pinned,
    )
}
