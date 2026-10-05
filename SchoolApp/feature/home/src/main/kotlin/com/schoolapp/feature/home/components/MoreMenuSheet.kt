package com.schoolapp.feature.home.components

import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.ListItemRow
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.navigation.MenuItem
import com.schoolapp.feature.home.R

@OptIn(ExperimentalMaterial3Api::class)
@Composable
internal fun MoreMenuSheet(
    items: List<MenuItem>,
    selectedId: String?,
    onSelect: (String) -> Unit,
    onDismiss: () -> Unit,
) {
    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = false),
        containerColor = AppColors.Surface,
    ) {
        SectionHeader(
            title = stringResource(R.string.home_more_title),
            modifier = Modifier.padding(horizontal = 16.dp),
        )
        LazyColumn(Modifier.navigationBarsPadding()) {
            items(items, key = { it.id }) { item ->
                ListItemRow(
                    title = item.label,
                    leadingIcon = item.icon,
                    selected = item.id == selectedId,
                    onClick = { onSelect(item.id) },
                )
            }
        }
    }
}
