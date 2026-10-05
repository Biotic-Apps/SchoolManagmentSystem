package com.schoolapp.feature.organisation.scope

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.widthIn
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import com.schoolapp.core.designsystem.component.ContentMaxWidth

/** Width-capped column for scope bar + list screens. */
@Composable
internal fun ScopedPane(modifier: Modifier = Modifier, content: @Composable ColumnScope.() -> Unit) {
    Column(modifier.fillMaxSize(), horizontalAlignment = Alignment.CenterHorizontally) {
        Column(Modifier.widthIn(max = ContentMaxWidth).fillMaxWidth().weight(1f), content = content)
    }
}
