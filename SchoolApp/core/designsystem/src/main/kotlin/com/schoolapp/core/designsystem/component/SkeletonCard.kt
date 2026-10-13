package com.schoolapp.core.designsystem.component

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.State
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.motion.rememberShimmerProgress
import com.schoolapp.core.designsystem.motion.shimmer
import com.schoolapp.core.designsystem.theme.AppColors

/** Placeholder with the shape of a typical list card (avatar, title, supporting line, trailing chip). */
@Composable
fun SkeletonCard(progress: State<Float>, modifier: Modifier = Modifier) {
    val shape = MaterialTheme.shapes.medium
    val line = MaterialTheme.shapes.extraSmall
    Row(
        modifier = modifier
            .fillMaxWidth()
            .background(AppColors.Selected.copy(alpha = 0.3f), shape)
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Spacer(Modifier.size(40.dp).shimmer(progress, CircleShape))
        Spacer(Modifier.width(12.dp))
        Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Spacer(Modifier.fillMaxWidth(0.6f).height(14.dp).shimmer(progress, line))
            Spacer(Modifier.fillMaxWidth(0.4f).height(12.dp).shimmer(progress, line))
        }
        Spacer(Modifier.width(12.dp))
        Spacer(Modifier.width(56.dp).height(22.dp).shimmer(progress, CircleShape))
    }
}

@Preview
@Composable
private fun SkeletonCardPreview() = PreviewContainer {
    SkeletonCard(rememberShimmerProgress())
}
