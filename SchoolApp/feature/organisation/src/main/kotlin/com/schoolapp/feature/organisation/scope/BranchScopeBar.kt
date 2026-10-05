package com.schoolapp.feature.organisation.scope

import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.ScopePicker
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.model.organisation.BranchOption

@Composable
internal fun BranchScopeBar(
    options: List<BranchOption>,
    selectedId: String?,
    onSelect: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    if (options.isEmpty()) return
    Row(modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp)) {
        ScopePicker(
            options = options.map { SwitcherOption(it.id, it.name) },
            selectedId = selectedId,
            onSelect = onSelect,
        )
    }
}
