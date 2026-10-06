package com.schoolapp.core.designsystem.component

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.ProgressBarRangeInfo
import androidx.compose.ui.semantics.progressBarRangeInfo
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.R
import com.schoolapp.core.designsystem.theme.AppColors

/** Title, percentage and a thin progress bar; [tone] colours the bar (e.g. warning when items are delayed). */
@Composable
fun ProgressRow(
    title: String,
    percent: Int,
    modifier: Modifier = Modifier,
    supporting: String? = null,
    tone: StatusTone = StatusTone.Success,
    onClick: (() -> Unit)? = null,
) {
    val clamped = percent.coerceIn(0, 100)
    val colors = tone.colors()
    val body = @Composable {
        Column(
            modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 12.dp),
            verticalArrangement = Arrangement.spacedBy(6.dp),
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.bodyLarge,
                    color = AppColors.TextPrimary,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.weight(1f),
                )
                Text(
                    text = stringResource(R.string.ds_percent, clamped),
                    style = MaterialTheme.typography.labelLarge,
                    color = colors.content,
                )
            }
            LinearProgressIndicator(
                progress = { clamped / 100f },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(6.dp)
                    .clip(MaterialTheme.shapes.small)
                    .semantics { progressBarRangeInfo = ProgressBarRangeInfo(clamped / 100f, 0f..1f) },
                color = colors.content,
                trackColor = AppColors.Border,
                drawStopIndicator = {},
            )
            if (supporting != null) {
                Text(supporting, style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
            }
        }
    }
    if (onClick != null) {
        Surface(onClick = onClick, color = AppColors.Surface) { body() }
    } else {
        body()
    }
}

@Preview
@Composable
private fun ProgressRowPreview() = PreviewContainer {
    ProgressRow(title = "Class 5 - A · Mathematics", percent = 42, supporting = "5 of 12 topics · 2 delayed", tone = StatusTone.Warning)
}
