package com.schoolapp.feature.health

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.schoolapp.core.model.RoleRef
import com.schoolapp.feature.health.menu.HealthMenuRoute

/** Menu `health` (principal, coordinator, head teacher, super admin): branch incidents and student health cards. */
@Composable
fun HealthMenuScreen(role: RoleRef, onOpen: (Any) -> Unit, modifier: Modifier = Modifier) {
    HealthMenuRoute(onOpen = onOpen, modifier = modifier)
}
