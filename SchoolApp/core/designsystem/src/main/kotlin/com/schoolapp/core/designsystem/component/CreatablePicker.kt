package com.schoolapp.core.designsystem.component

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material.icons.outlined.ArrowDropDown
import androidx.compose.material.icons.outlined.Check
import androidx.compose.material.icons.outlined.Schedule
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.tooling.preview.Preview
import com.schoolapp.core.designsystem.R
import com.schoolapp.core.designsystem.theme.AppColors

/** A choice in a [CreatablePickerField]; [muted] options (busy elsewhere) stay selectable and get a clock icon. */
@Immutable
data class PickerOption(
    val id: String,
    val label: String,
    val supporting: String? = null,
    val muted: Boolean = false,
)

/**
 * Read-only field that opens a searchable sheet. [noneLabel] adds a "no value" row (onSelect(null));
 * [onCreate] adds "Create “typed text”" when the text matches no option (rooms, subjects created inline).
 * The list gets a search box once it is longer than a few rows, or whenever creating is possible.
 */
@Composable
fun CreatablePickerField(
    label: String,
    options: List<PickerOption>,
    selectedId: String?,
    onSelect: (String?) -> Unit,
    modifier: Modifier = Modifier,
    noneLabel: String? = null,
    onCreate: ((String) -> Unit)? = null,
    createLabel: @Composable (String) -> String = { stringResource(R.string.ds_create_named, it) },
    enabled: Boolean = true,
    errorText: String? = null,
    fallbackValue: String? = null,
) {
    var open by rememberSaveable { mutableStateOf(false) }
    val value = options.firstOrNull { it.id == selectedId }?.label ?: fallbackValue ?: noneLabel.orEmpty()
    PickerField(
        value = value,
        label = label,
        onClick = { open = true },
        modifier = modifier,
        errorText = errorText,
        enabled = enabled,
        icon = Icons.Outlined.ArrowDropDown,
    )
    if (open) {
        CreatablePickerSheet(
            title = label,
            options = options,
            selectedId = selectedId,
            onDismiss = { open = false },
            onSelect = {
                open = false
                onSelect(it)
            },
            noneLabel = noneLabel,
            onCreate = onCreate?.let { create -> { name: String -> open = false; create(name) } },
            createLabel = createLabel,
        )
    }
}

/** The sheet behind [CreatablePickerField]; usable on its own (e.g. "Add subject…" buttons). */
@Composable
fun CreatablePickerSheet(
    title: String,
    options: List<PickerOption>,
    selectedId: String?,
    onDismiss: () -> Unit,
    onSelect: (String?) -> Unit,
    noneLabel: String? = null,
    onCreate: ((String) -> Unit)? = null,
    createLabel: @Composable (String) -> String = { stringResource(R.string.ds_create_named, it) },
) {
    var query by rememberSaveable { mutableStateOf("") }
    val typed = query.trim()
    val shown = if (typed.isEmpty()) options else options.filter { it.label.contains(typed, ignoreCase = true) }
    val canCreate = onCreate != null && typed.isNotEmpty() && options.none { it.label.equals(typed, ignoreCase = true) }
    AppBottomSheet(title = title, onDismiss = onDismiss) {
        if (onCreate != null || options.size > SEARCH_AFTER) {
            AppTextField(
                value = query,
                onValueChange = { query = it },
                label = stringResource(if (onCreate != null) R.string.ds_search_or_new else R.string.ds_search),
                kind = FieldKind.Title,
                imeAction = ImeAction.Done,
                onImeAction = { if (canCreate) onCreate?.invoke(typed) },
            )
        }
        if (canCreate) {
            ListItemRow(
                title = createLabel(typed),
                leadingIcon = Icons.Outlined.Add,
                onClick = { onCreate?.invoke(typed) },
            )
        }
        if (noneLabel != null && typed.isEmpty()) {
            OptionRow(PickerOption("", noneLabel), selectedId == null) { onSelect(null) }
        }
        shown.forEach { option -> OptionRow(option, option.id == selectedId) { onSelect(option.id) } }
        if (shown.isEmpty() && !canCreate) {
            Text(stringResource(R.string.ds_no_matches), color = AppColors.TextSecondary)
        }
    }
}

@Composable
private fun OptionRow(option: PickerOption, selected: Boolean, onClick: () -> Unit) {
    ListItemRow(
        title = option.label,
        supporting = option.supporting,
        selected = selected,
        onClick = onClick,
        leadingIcon = if (option.muted) Icons.Outlined.Schedule else null,
        trailing = if (selected) {
            { Icon(Icons.Outlined.Check, contentDescription = null, tint = AppColors.Primary) }
        } else {
            null
        },
    )
}

private const val SEARCH_AFTER = 7

@Preview
@Composable
private fun CreatablePickerFieldPreview() = PreviewContainer {
    CreatablePickerField(
        label = "Room",
        options = listOf(PickerOption("r1", "Room 101"), PickerOption("r2", "Lab", "busy: Class 8 B", muted = true)),
        selectedId = "r1",
        onSelect = {},
        noneLabel = "No room",
        onCreate = {},
    )
}
