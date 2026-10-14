package com.schoolapp.feature.inventory

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.schoolapp.core.model.RoleRef
import com.schoolapp.feature.inventory.shell.InventoryRoute

/**
 * Menu `inventory` (Inventory & Purchasing): stock, items, movements, tagged assets, purchase requests
 * (with orders, receiving and billing) and student sales — the same as the web panel.
 */
@Composable
fun InventoryMenuScreen(role: RoleRef, onOpen: (Any) -> Unit, modifier: Modifier = Modifier) {
    InventoryRoute(roleKey = role.key, onOpen = onOpen, modifier = modifier)
}
