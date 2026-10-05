package com.schoolapp.core.designsystem.component

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Apartment
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import com.schoolapp.core.designsystem.R

/** Branch/scope selector; read-only when only one option exists. */
@Composable
fun ScopePicker(
    options: List<SwitcherOption>,
    selectedId: String?,
    onSelect: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    SwitcherMenu(
        options = options,
        selectedId = selectedId,
        onSelect = onSelect,
        icon = Icons.Outlined.Apartment,
        actionLabel = stringResource(R.string.ds_switch_branch),
        modifier = modifier,
    )
}

@Preview
@Composable
private fun ScopePickerPreview() = PreviewContainer {
    ScopePicker(
        options = listOf(SwitcherOption("1", "Main Branch"), SwitcherOption("2", "City Branch")),
        selectedId = "1",
        onSelect = {},
    )
}
