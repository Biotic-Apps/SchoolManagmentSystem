package com.schoolapp.feature.dashboard.parent

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError

/** Fee tile "Download challan": progress, last failure, and the one-shot signed url the route opens. */
@Immutable
data class ChallanState(
    val isDownloading: Boolean = false,
    val error: AppError? = null,
    val urlToOpen: String? = null,
)
