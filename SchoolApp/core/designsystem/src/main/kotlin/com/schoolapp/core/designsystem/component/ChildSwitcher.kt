package com.schoolapp.core.designsystem.component

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.ChildCare
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.tooling.preview.Preview
import com.schoolapp.core.designsystem.R

@Composable
fun ChildSwitcher(
    children: List<SwitcherOption>,
    selectedId: String?,
    onSelect: (String) -> Unit,
    modifier: Modifier = Modifier,
    labelMaxWidth: Dp = DefaultLabelMaxWidth,
) {
    SwitcherMenu(
        options = children,
        selectedId = selectedId,
        onSelect = onSelect,
        icon = Icons.Outlined.ChildCare,
        actionLabel = stringResource(R.string.ds_switch_child),
        modifier = modifier,
        labelMaxWidth = labelMaxWidth,
    )
}

@Preview
@Composable
private fun ChildSwitcherPreview() = PreviewContainer {
    ChildSwitcher(
        children = listOf(
            SwitcherOption("1", "Ayesha Khan", "Class 5 - A"),
            SwitcherOption("2", "Omar Khan", "Class 2 - B"),
        ),
        selectedId = "1",
        onSelect = {},
    )
}
