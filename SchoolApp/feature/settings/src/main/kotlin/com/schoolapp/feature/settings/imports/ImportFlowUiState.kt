package com.schoolapp.feature.settings.imports

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.organisation.AcademicSession
import com.schoolapp.core.model.settings.ImportDetail
import com.schoolapp.core.model.settings.ImportKind
import com.schoolapp.core.model.settings.ImportTotals
import com.schoolapp.core.model.settings.NamedOption

internal enum class CommitMode { ALL, SKIP }

internal enum class TemplateResult { SAVED }

@Immutable
internal data class ImportFlowUiState(
    // Step 1: where and what
    val branchesLoading: Boolean = true,
    val branchesError: AppError? = null,
    val branches: List<NamedOption> = emptyList(),
    val branchId: String? = null,
    val sessionsLoading: Boolean = false,
    val sessions: List<AcademicSession> = emptyList(),
    val sessionId: String? = null,
    val kind: ImportKind = ImportKind.STUDENTS,
    // Step 2: template
    val templateSaving: Boolean = false,
    val templateResult: TemplateResult? = null,
    val templateError: AppError? = null,
    // Step 3 and result
    val importId: String? = null,
    val fileName: String? = null,
    val uploading: Boolean = false,
    val uploadError: AppError? = null,
    val detailLoading: Boolean = false,
    val detailError: AppError? = null,
    val detail: ImportDetail? = null,
    /** A commit was requested for the open import (keeps polling until it leaves READY/INVALID). */
    val committed: Boolean = false,
    val commitDialog: CommitMode? = null,
    val committing: Boolean = false,
    val commitError: AppError? = null,
    /** Bumped whenever the history should reload (upload, commit finished). */
    val historyVersion: Int = 0,
) {
    val totals: ImportTotals get() = detail?.totals ?: ImportTotals(0, 0, 0)
    val status: String? get() = detail?.status
    val busy: Boolean get() = detail?.isBusy == true
    val ready: Boolean get() = branchId != null && sessionId != null
    val shownFileName: String? get() = detail?.fileName ?: fileName

    val canCommitAll: Boolean
        get() = !committed && status == ImportDetail.READY && totals.invalid == 0 && totals.valid > 0
    val canCommitValid: Boolean
        get() = !committed && (status == ImportDetail.READY || status == ImportDetail.INVALID) && totals.invalid > 0 && totals.valid > 0
    val needsNewFile: Boolean get() = status == ImportDetail.INVALID && totals.valid == 0

    /** Polled every 2 s while the server validates / commits, or right after a commit request. */
    val shouldPoll: Boolean
        get() = busy || (committed && (status == ImportDetail.READY || status == ImportDetail.INVALID))
}
