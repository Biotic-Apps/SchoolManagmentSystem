package com.schoolapp.core.designsystem.component

import androidx.compose.runtime.Composable
import androidx.compose.runtime.ReadOnlyComposable
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.designsystem.theme.AppTheme
import com.schoolapp.core.designsystem.theme.StatusColors

enum class StatusTone { Success, Warning, Error, Info, Neutral }

@Composable
@ReadOnlyComposable
internal fun StatusTone.colors(): StatusColors = with(AppTheme.extendedColors) {
    when (this@colors) {
        StatusTone.Success -> success
        StatusTone.Warning -> warning
        StatusTone.Error -> error
        StatusTone.Info -> info
        StatusTone.Neutral -> StatusColors(AppColors.TextSecondary, AppColors.Background)
    }
}

/** Brand tint (teal on mint) for neutral icon tiles, so plain metrics still carry the app's colour. */
internal fun primaryTileColors(): StatusColors = StatusColors(AppColors.Primary, AppColors.Selected)
