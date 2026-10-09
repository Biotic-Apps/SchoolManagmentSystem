package com.schoolapp.core.designsystem.component

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyListScope
import androidx.compose.foundation.lazy.LazyListState
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.motion.AnimatedListScope
import com.schoolapp.core.designsystem.motion.rememberEntranceGate

/**
 * The screen's single scroll container, centred and width-capped so it stays readable on tablets and desktop windows.
 * Items stagger in on first load and glide when inserted, removed or reordered (keyed items).
 * Pass `itemSpacing = 0.dp` when the page uses [dataListItems] (rows must touch to form one card).
 */
@Composable
fun ScreenColumn(
    modifier: Modifier = Modifier,
    maxWidth: Dp = ContentMaxWidth,
    contentPadding: PaddingValues = PaddingValues(16.dp),
    itemSpacing: Dp = 12.dp,
    state: LazyListState = rememberLazyListState(),
    content: LazyListScope.() -> Unit,
) {
    val gate = rememberEntranceGate()
    Box(modifier.fillMaxSize(), contentAlignment = Alignment.TopCenter) {
        CompositionLocalProvider(LocalInsetContent provides true) {
            LazyColumn(
                modifier = Modifier.widthIn(max = maxWidth).fillMaxWidth(),
                state = state,
                contentPadding = contentPadding,
                verticalArrangement = Arrangement.spacedBy(itemSpacing),
            ) { AnimatedListScope(this, gate).content() }
        }
    }
}

val ContentMaxWidth: Dp = 840.dp
