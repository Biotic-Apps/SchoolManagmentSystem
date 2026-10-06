package com.schoolapp.feature.attendance.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.clearAndSetSemantics
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.StatusTone

internal data class CountItem(val label: String, val value: Int, val tone: StatusTone)

/** Tinted count tiles, three per row so labels never get squeezed on phones. */
@Composable
internal fun CountsGrid(items: List<CountItem>, modifier: Modifier = Modifier, columns: Int = 3) {
    Column(modifier, verticalArrangement = Arrangement.spacedBy(8.dp)) {
        items.chunked(columns).forEach { row ->
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                row.forEach { CountTile(it, Modifier.weight(1f)) }
                repeat(columns - row.size) { Spacer(Modifier.weight(1f)) }
            }
        }
    }
}

@Composable
private fun CountTile(item: CountItem, modifier: Modifier) {
    val colors = item.tone.toneColors()
    Column(
        modifier
            .background(colors.container, RoundedCornerShape(8.dp))
            .padding(8.dp)
            .clearAndSetSemantics { contentDescription = "${item.value} ${item.label}" },
    ) {
        Text(item.value.toString(), style = MaterialTheme.typography.titleMedium, color = colors.content)
        Text(item.label, style = MaterialTheme.typography.bodySmall, color = colors.content)
    }
}
