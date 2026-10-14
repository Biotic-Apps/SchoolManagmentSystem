package com.schoolapp.feature.home.components

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Inbox
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.theme.SchoolTheme
import com.schoolapp.core.navigation.MenuIds
import com.schoolapp.core.navigation.NavigationCatalog
import com.schoolapp.feature.home.ModulePhases
import com.schoolapp.feature.home.R

/** Fallback destination for a menu id that has no screen registered. */
@Composable
internal fun MenuPlaceholder(menuId: String, modifier: Modifier = Modifier) {
    val item = NavigationCatalog.find(menuId)
    val phase = ModulePhases.phaseFor(menuId)
    Box(modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        EmptyState(
            title = item?.label ?: menuId,
            message = when {
                phase != null -> stringResource(R.string.home_coming_in_phase, phase)
                else -> stringResource(R.string.home_coming_soon)
            },
            icon = item?.icon ?: Icons.Outlined.Inbox,
        )
    }
}

@Preview(showBackground = true)
@Composable
private fun MenuPlaceholderPreview() = SchoolTheme { MenuPlaceholder(MenuIds.ATTENDANCE) }
