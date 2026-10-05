package com.schoolapp.core.navigation

import androidx.compose.runtime.Immutable
import androidx.compose.ui.graphics.vector.ImageVector
import com.schoolapp.core.model.Permission

@Immutable
data class MenuItem(
    val id: String,
    val label: String,
    val permission: Permission,
    val icon: ImageVector,
    /** Compact label for bottom bar / rail; falls back to [label]. */
    val shortLabel: String = ShortLabels[id] ?: label,
)
