package com.schoolapp.feature.organisation.components

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.ui.appErrorMessage

/** Shown above content that is still visible after a failed refresh. */
@Composable
internal fun RefreshErrorBanner(error: AppError?, modifier: Modifier = Modifier) {
    if (error == null) return
    InlineMessage(text = appErrorMessage(error), tone = StatusTone.Error, modifier = modifier)
}
