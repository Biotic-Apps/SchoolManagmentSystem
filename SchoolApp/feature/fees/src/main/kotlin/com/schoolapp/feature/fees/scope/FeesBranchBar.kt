package com.schoolapp.feature.fees.scope

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.ScopePicker
import com.schoolapp.core.designsystem.component.SwitcherOption

/** Branch switcher for super admin and other global roles; nothing for a branch-bound role. */
@Composable
internal fun FeesBranchBar(state: FeesScopeState, onSelect: (String) -> Unit, modifier: Modifier = Modifier) {
    if (state.options.size < 2) return
    ScopePicker(
        options = state.options.map { SwitcherOption(it.id, it.name) },
        selectedId = state.branch?.id,
        onSelect = onSelect,
        modifier = modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp),
    )
}
