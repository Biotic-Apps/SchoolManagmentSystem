package com.schoolapp.feature.dashboard.parent.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.State
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.SkeletonCard
import com.schoolapp.core.designsystem.motion.rememberShimmerProgress
import com.schoolapp.core.designsystem.motion.shimmer

private const val TILE_COUNT = 4
private const val CARD_COUNT = 3

/** Placeholder while the child's home loads: KPI tile blocks, then list cards, all shimmering in sync. */
@Composable
internal fun ParentHomeSkeleton(modifier: Modifier = Modifier) {
    val progress = rememberShimmerProgress()
    Column(modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        AdaptiveCells(count = TILE_COUNT) { _, cellModifier -> TileBlock(progress, cellModifier.fillMaxHeight()) }
        repeat(CARD_COUNT) { SkeletonCard(progress) }
    }
}

@Composable
private fun TileBlock(progress: State<Float>, modifier: Modifier) {
    Spacer(modifier.height(112.dp).shimmer(progress, MaterialTheme.shapes.medium))
}
