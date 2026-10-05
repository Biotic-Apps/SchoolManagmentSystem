package com.schoolapp.core.navigation

import com.schoolapp.core.model.CustomRole
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.RoleRef
import com.schoolapp.core.model.SessionContext

object NavigationCatalog {

    val entries: List<MenuItem> = CatalogEntries

    private val byId: Map<String, MenuItem> = entries.associateBy { it.id }

    fun find(id: String): MenuItem? = byId[id]

    fun defaultOrder(role: RoleKey): List<String> = RoleMenuOrder[role].orEmpty()

    fun labelFor(role: RoleRef, id: String): String =
        (role as? RoleKey)?.let { RoleLabelOverrides[it]?.get(id) } ?: byId[id]?.label ?: id

    /**
     * System role: its default list filtered by held permissions.
     * Custom role: every catalogue entry whose `.view` permission it holds, in catalogue order.
     */
    fun menuFor(session: SessionContext): List<MenuItem> = when (val role = session.activeRole) {
        is RoleKey -> defaultOrder(role)
            .mapNotNull(byId::get)
            .filter { session.has(it.permission) }
            .map { it.copy(label = labelFor(role, it.id)) }
        is CustomRole -> entries.filter { session.has(it.permission) }
    }
}
