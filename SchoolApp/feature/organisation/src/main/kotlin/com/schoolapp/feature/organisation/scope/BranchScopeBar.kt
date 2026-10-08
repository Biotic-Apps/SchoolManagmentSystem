package com.schoolapp.feature.organisation.scope

import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.schoolapp.core.designsystem.component.ScopePicker
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.model.organisation.BranchOption

/** Branch picker for multi-branch users; callers place it as the first item of the page's list. */
@Composable
internal fun BranchScopeBar(
    options: List<BranchOption>,
    selectedId: String?,
    onSelect: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    if (options.isEmpty()) return
    Row(modifier.fillMaxWidth()) {
        ScopePicker(
            options = options.map { SwitcherOption(it.id, it.name) },
            selectedId = selectedId,
            onSelect = onSelect,
        )
    }
}
