package com.schoolapp.feature.admin

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.schoolapp.core.model.RoleRef
import com.schoolapp.feature.admin.roles.RoleEditorDestination
import com.schoolapp.feature.admin.roles.list.RolesListRoute

/** Menu `roles` (Roles & Permissions): system and custom roles, and the permission matrix of each. */
@Composable
fun RolesMenuScreen(role: RoleRef, onOpen: (Any) -> Unit, modifier: Modifier = Modifier) {
    RolesListRoute(onOpenRole = { onOpen(RoleEditorDestination(it)) }, modifier = modifier)
}
