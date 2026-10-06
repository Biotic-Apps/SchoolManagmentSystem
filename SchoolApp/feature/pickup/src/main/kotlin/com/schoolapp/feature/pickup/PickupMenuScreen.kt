package com.schoolapp.feature.pickup

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.schoolapp.core.model.RoleRef
import com.schoolapp.feature.pickup.gate.GateRoute

/** Menu `pickup`: the gate desk with `pickup.edit`, otherwise today's early leaves and departures read-only. */
@Composable
fun PickupMenuScreen(role: RoleRef, onOpen: (Any) -> Unit, modifier: Modifier = Modifier) {
    GateRoute(onOpen = onOpen, modifier = modifier)
}
