package com.schoolapp.feature.students.sections

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.SearchField
import com.schoolapp.feature.students.R

/** Branch student search; results arrive as the user types, so the IME Search key just hides the keyboard. */
@Composable
internal fun StudentSearchBar(
    query: String,
    onQueryChange: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    val keyboard = LocalSoftwareKeyboardController.current
    val focusManager = LocalFocusManager.current
    SearchField(
        value = query,
        onValueChange = onQueryChange,
        placeholder = stringResource(R.string.students_search_hint),
        onSearch = {
            keyboard?.hide()
            focusManager.clearFocus()
        },
        modifier = modifier,
    )
}
