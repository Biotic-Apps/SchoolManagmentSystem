package com.schoolapp.feature.admin.common

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.feature.admin.R

/** "Load more" at the end of a paged list. */
@Composable
internal fun LoadMoreButton(loading: Boolean, onClick: () -> Unit, modifier: Modifier = Modifier) {
    SecondaryButton(
        text = stringResource(R.string.admin_load_more),
        onClick = onClick,
        loading = loading,
        enabled = !loading,
        modifier = modifier.fillMaxWidth().padding(top = 8.dp),
    )
}
