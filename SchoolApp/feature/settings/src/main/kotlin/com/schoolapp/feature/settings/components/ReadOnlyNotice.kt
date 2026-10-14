package com.schoolapp.feature.settings.components

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.feature.settings.R

/** Shown on settings forms when the role can view but not change them. */
@Composable
internal fun ReadOnlyNotice(modifier: Modifier = Modifier) {
    InlineMessage(stringResource(R.string.settings_read_only), StatusTone.Info, modifier)
}
