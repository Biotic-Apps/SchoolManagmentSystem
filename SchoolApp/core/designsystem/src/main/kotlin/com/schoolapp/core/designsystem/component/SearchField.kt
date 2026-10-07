package com.schoolapp.core.designsystem.component

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Close
import androidx.compose.material.icons.outlined.Search
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.tooling.preview.Preview
import com.schoolapp.core.designsystem.R
import com.schoolapp.core.designsystem.theme.AppColors

@Composable
fun SearchField(
    value: String,
    onValueChange: (String) -> Unit,
    modifier: Modifier = Modifier,
    placeholder: String = stringResource(R.string.ds_search),
    onSearch: () -> Unit = {},
) {
    AppTextField(
        value = value,
        onValueChange = onValueChange,
        label = placeholder,
        modifier = modifier,
        kind = FieldKind.Text,
        imeAction = ImeAction.Search,
        onImeAction = onSearch,
        leadingIcon = { Icon(Icons.Outlined.Search, contentDescription = null, tint = AppColors.TextSecondary) },
        trailingIcon = if (value.isNotEmpty()) {
            {
                IconButton(onClick = { onValueChange("") }) {
                    Icon(Icons.Outlined.Close, contentDescription = stringResource(R.string.ds_clear_search))
                }
            }
        } else {
            null
        },
    )
}

@Preview
@Composable
private fun SearchFieldPreview() = PreviewContainer { SearchField(value = "Ayesha", onValueChange = {}) }
