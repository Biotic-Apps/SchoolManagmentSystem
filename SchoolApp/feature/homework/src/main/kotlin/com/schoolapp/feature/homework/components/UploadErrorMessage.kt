package com.schoolapp.feature.homework.components

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.homework.R

/** Failed attachment upload; uploads need a connection. */
@Composable
internal fun UploadErrorMessage(error: AppError, modifier: Modifier = Modifier) {
    val text = if (error is AppError.Network) stringResource(R.string.homework_upload_offline) else appErrorMessage(error)
    InlineMessage(text, StatusTone.Error, modifier)
}
