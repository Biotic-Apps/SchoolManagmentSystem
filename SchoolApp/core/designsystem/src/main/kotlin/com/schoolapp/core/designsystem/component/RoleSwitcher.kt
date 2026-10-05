package com.schoolapp.core.designsystem.component

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.SwitchAccount
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.tooling.preview.Preview
import com.schoolapp.core.designsystem.R

@Composable
fun RoleSwitcher(
    roles: List<SwitcherOption>,
    selectedId: String?,
    onSelect: (String) -> Unit,
    modifier: Modifier = Modifier,
    labelMaxWidth: Dp = DefaultLabelMaxWidth,
) {
    SwitcherMenu(
        options = roles,
        selectedId = selectedId,
        onSelect = onSelect,
        icon = Icons.Outlined.SwitchAccount,
        actionLabel = stringResource(R.string.ds_switch_role),
        modifier = modifier,
        labelMaxWidth = labelMaxWidth,
    )
}

@Preview
@Composable
private fun RoleSwitcherPreview() = PreviewContainer {
    RoleSwitcher(
        roles = listOf(SwitcherOption("TEACHER", "Teacher"), SwitcherOption("PARENT", "Parent")),
        selectedId = "TEACHER",
        onSelect = {},
    )
}
