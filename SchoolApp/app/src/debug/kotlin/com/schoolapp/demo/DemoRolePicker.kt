package com.schoolapp.demo

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.model.CustomRole
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.RoleRef

@OptIn(ExperimentalLayoutApi::class)
@Composable
internal fun DemoRolePicker(
    modifier: Modifier = Modifier,
    viewModel: DemoViewModel = hiltViewModel(),
) {
    AppCard(modifier) {
        SectionHeader(
            title = "Preview a role",
            subtitle = "Debug build only. Uses local demo data, no server. " +
                "Phone code sign-in: ${DemoOtp.PHONE} with code ${DemoOtp.CODE} (parent).",
        )
        FlowRow(
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            viewModel.roles.forEach { role ->
                SecondaryButton(text = role.displayName(), onClick = { viewModel.start(role) })
            }
        }
    }
}

private fun RoleRef.displayName(): String = when (this) {
    is RoleKey -> key.words()
    is CustomRole -> "${key.removePrefix("CUSTOM_").words()} (custom)"
}

private fun String.words(): String =
    lowercase().split('_').joinToString(" ") { part -> part.replaceFirstChar { it.uppercase() } }
