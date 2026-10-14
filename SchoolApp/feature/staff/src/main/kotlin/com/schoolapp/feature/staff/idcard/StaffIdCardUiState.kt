package com.schoolapp.feature.staff.idcard

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.staff.idcard.IdCardStatus
import com.schoolapp.core.model.staff.idcard.StaffIdCard

enum class IdCardNotice { QUEUED, READY }

data class StaffIdCardUiState(
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    /** Null once loaded = no card generated yet. */
    val card: StaffIdCard? = null,
    val error: AppError? = null,
    val isGenerating: Boolean = false,
    val isOpening: Boolean = false,
    val actionError: AppError? = null,
    val notice: IdCardNotice? = null,
    val openUrl: String? = null,
) {
    val isPending: Boolean get() = card?.status == IdCardStatus.PENDING || isGenerating
    val isReady: Boolean get() = card?.status == IdCardStatus.READY && card.fileUrl != null
    val isFailed: Boolean get() = card?.status == IdCardStatus.FAILED
}
