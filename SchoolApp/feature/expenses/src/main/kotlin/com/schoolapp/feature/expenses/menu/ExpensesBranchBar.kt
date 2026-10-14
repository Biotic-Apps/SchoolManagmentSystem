package com.schoolapp.feature.expenses.menu

import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.ScopePicker
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.model.organisation.BranchOption

/** Branch picker shown only when the role manages more than one branch; expenses are recorded per branch. */
@Composable
internal fun ExpensesBranchBar(
    branches: List<BranchOption>,
    selectedId: String,
    onSelect: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    if (branches.size < 2) return
    Row(modifier.fillMaxWidth().padding(start = 16.dp, top = 8.dp, end = 16.dp)) {
        ScopePicker(
            options = branches.map { SwitcherOption(it.id, it.name) },
            selectedId = selectedId,
            onSelect = onSelect,
        )
    }
}
