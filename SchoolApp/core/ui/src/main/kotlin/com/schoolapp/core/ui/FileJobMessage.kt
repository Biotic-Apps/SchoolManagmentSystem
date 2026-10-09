package com.schoolapp.core.ui

import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.common.result.AppError

/** Message for a server-generated file (challan, report) that is still being prepared or failed to build. */
@Composable
fun fileJobMessage(error: AppError): String = when ((error as? AppError.Server)?.code) {
    FILE_NOT_READY -> stringResource(R.string.ui_file_not_ready)
    FILE_FAILED -> stringResource(R.string.ui_file_failed)
    else -> appErrorMessage(error)
}

private const val FILE_NOT_READY = "FILE_NOT_READY"
private const val FILE_FAILED = "PDF_FAILED"
