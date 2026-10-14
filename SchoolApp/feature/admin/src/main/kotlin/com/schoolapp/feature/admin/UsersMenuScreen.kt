package com.schoolapp.feature.admin

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import com.schoolapp.core.model.RoleRef
import com.schoolapp.feature.admin.users.CreateUserDestination
import com.schoolapp.feature.admin.users.UserDetailDestination
import com.schoolapp.feature.admin.users.list.UsersListRoute

/** Menu `users` (Principals & Admin Users): accounts, roles and scope, sign-in controls. */
@Composable
fun UsersMenuScreen(role: RoleRef, onOpen: (Any) -> Unit, modifier: Modifier = Modifier) {
    UsersListRoute(
        onOpenUser = { onOpen(UserDetailDestination(it)) },
        onAddUser = { onOpen(CreateUserDestination) },
        modifier = modifier,
        viewModel = hiltViewModel(key = "users_${role.key}"),
    )
}
