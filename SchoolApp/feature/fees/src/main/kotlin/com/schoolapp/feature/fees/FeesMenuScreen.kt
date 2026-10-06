package com.schoolapp.feature.fees

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.RoleRef
import com.schoolapp.feature.fees.parent.ParentFeesRoute
import com.schoolapp.feature.fees.staff.StaffFeesRoute

/** Menu `fees`: parents see the active child's fees; accountant/principal see collection, dues and proofs. */
@Composable
fun FeesMenuScreen(role: RoleRef, onOpen: (Any) -> Unit, onOpenApprovals: (() -> Unit)?, modifier: Modifier = Modifier) {
    when (role) {
        RoleKey.PARENT -> ParentFeesRoute(onOpen, modifier, hiltViewModel(key = "fees_${role.key}"))
        else -> StaffFeesRoute(roleKey = role.key, onOpen = onOpen, onOpenApprovals = onOpenApprovals, modifier = modifier)
    }
}
