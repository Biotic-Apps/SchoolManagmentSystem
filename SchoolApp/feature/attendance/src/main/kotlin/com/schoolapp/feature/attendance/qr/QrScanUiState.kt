package com.schoolapp.feature.attendance.qr

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.attendance.QrScanDirection
import com.schoolapp.core.model.attendance.QrScanLog
import com.schoolapp.core.model.attendance.QrScanResult

enum class QrScanProblem { INVALID_CODE, SCANNER_UNAVAILABLE }

@Immutable
data class QrScanUiState(
    /** Session holds `attendance.add`; the entry card is hidden otherwise. */
    val canScan: Boolean = false,
    val direction: QrScanDirection = QrScanDirection.IN,
    val isProcessing: Boolean = false,
    val lastResult: QrScanResult? = null,
    val problem: QrScanProblem? = null,
    val error: AppError? = null,
    val logs: List<QrScanLog> = emptyList(),
    val logsLoading: Boolean = true,
)
