package com.schoolapp.core.ui

import androidx.compose.runtime.Composable
import androidx.compose.runtime.ReadOnlyComposable
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.model.CustomRole
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.RoleRef

/** System roles use fixed labels; custom roles use the server's name or a readable form of the key. */
@Composable
@ReadOnlyComposable
fun roleLabel(role: RoleRef, customName: String? = null): String = when (role) {
    is RoleKey -> stringResource(role.labelRes())
    is CustomRole -> customName ?: humanizeKey(role.key.removePrefix(CUSTOM_PREFIX))
}

private const val CUSTOM_PREFIX = "CUSTOM_"

private fun RoleKey.labelRes(): Int = when (this) {
    RoleKey.SUPER_ADMIN -> R.string.role_super_admin
    RoleKey.PRINCIPAL -> R.string.role_principal
    RoleKey.COORDINATOR -> R.string.role_coordinator
    RoleKey.HEAD_TEACHER -> R.string.role_head_teacher
    RoleKey.TEACHER -> R.string.role_teacher
    RoleKey.HELPER -> R.string.role_helper
    RoleKey.ACCOUNTANT -> R.string.role_accountant
    RoleKey.PARENT -> R.string.role_parent
}
