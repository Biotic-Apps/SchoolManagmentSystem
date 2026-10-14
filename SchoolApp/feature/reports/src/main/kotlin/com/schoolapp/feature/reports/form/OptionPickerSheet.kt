package com.schoolapp.feature.reports.form

import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.ListItemRow
import com.schoolapp.core.designsystem.component.SearchField
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.feature.reports.R

/** Single choice from a list; optional params get an "All" row that clears the value. Long lists get a search box. */
@Composable
internal fun OptionPickerSheet(
    title: String,
    options: List<SwitcherOption>,
    selectedId: String?,
    allowAll: Boolean,
    onSelect: (String) -> Unit,
    onDismiss: () -> Unit,
) {
    var query by remember { mutableStateOf("") }
    val shown = remember(options, query) {
        val needle = query.trim().lowercase()
        if (needle.isEmpty()) options else options.filter { needle in it.label.lowercase() || needle in it.supporting.orEmpty().lowercase() }
    }
    AppBottomSheet(title = title, onDismiss = onDismiss) {
        if (options.size > SEARCH_THRESHOLD) {
            SearchField(value = query, onValueChange = { query = it })
        }
        LazyColumn(Modifier.heightIn(max = 480.dp)) {
            if (allowAll) {
                item(key = "all") {
                    ListItemRow(
                        title = stringResource(R.string.reports_all),
                        selected = selectedId.isNullOrEmpty(),
                        onClick = { onSelect("") },
                    )
                }
            }
            items(shown.size, key = { shown[it].id }) { index ->
                val option = shown[index]
                ListItemRow(
                    title = option.label,
                    supporting = option.supporting,
                    selected = option.id == selectedId,
                    onClick = { onSelect(option.id) },
                )
            }
        }
    }
}

private const val SEARCH_THRESHOLD = 8
