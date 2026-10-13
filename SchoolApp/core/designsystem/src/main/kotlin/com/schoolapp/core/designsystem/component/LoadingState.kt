package com.schoolapp.core.designsystem.component

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.widthIn
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.clearAndSetSemantics
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.R
import com.schoolapp.core.designsystem.motion.entrance
import com.schoolapp.core.designsystem.motion.rememberShimmerProgress
import com.schoolapp.core.designsystem.theme.AppColors

/**
 * Loading placeholder. By default a shimmering skeleton of [rows] list cards (reads as "content is coming"
 * and avoids layout jumps); with a [message] it is a compact spinner and text, for partial loads.
 * Adds the page gutter itself only when not already inside a padded container.
 */
@Composable
fun LoadingState(
    modifier: Modifier = Modifier,
    message: String? = null,
    rows: Int = DEFAULT_ROWS,
) {
    val description = message ?: stringResource(R.string.ds_loading)
    val gutter = if (LocalInsetContent.current) 0.dp else 16.dp
    Box(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = gutter, vertical = gutter)
            .clearAndSetSemantics { contentDescription = description }
            .entrance(offset = 0.dp),
        contentAlignment = Alignment.TopCenter,
    ) {
        if (message != null) {
            Spinner(message)
        } else {
            val progress = rememberShimmerProgress()
            Column(Modifier.widthIn(max = ContentMaxWidth).fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                repeat(rows) { SkeletonCard(progress) }
            }
        }
    }
}

@Composable
private fun Spinner(message: String) {
    Column(
        modifier = Modifier.fillMaxWidth().padding(vertical = 24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        AppLottie(
            resId = R.raw.anim_loading,
            modifier = Modifier.size(80.dp),
        )
        Text(message, style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
    }
}

private const val DEFAULT_ROWS = 3

@Preview
@Composable
private fun LoadingStatePreview() = PreviewContainer {
    LoadingState()
}

@Preview
@Composable
private fun LoadingStateMessagePreview() = PreviewContainer {
    LoadingState(message = "Loading older messages")
}
