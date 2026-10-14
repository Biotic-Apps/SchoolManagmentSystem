package com.schoolapp.feature.admin.roles

import androidx.compose.runtime.Immutable
import androidx.compose.ui.state.ToggleableState
import com.schoolapp.core.model.roles.PermissionInfo
import com.schoolapp.core.navigation.NavigationCatalog
import com.schoolapp.core.ui.humanizeKey

/** Matrix columns, in the web panel's order. */
enum class MatrixAction(val key: String) { VIEW("view"), ADD("add"), EDIT("edit"), SUBMIT("submit"), APPROVE("approve"), PUBLISH("publish"), EXPORT("export"), DELETE("delete") }

/** One module row: the `module.action` permissions it offers, keyed by column. */
@Immutable
data class MatrixRow(
    val module: String,
    val label: String,
    val cells: Map<MatrixAction, PermissionInfo>,
) {
    val keys: List<String> = MatrixAction.entries.mapNotNull { cells[it]?.key }
}

@Immutable
data class PermissionMatrix(val rows: List<MatrixRow>, val specials: List<PermissionInfo>)

private fun matrixParts(permission: PermissionInfo): Pair<String, MatrixAction>? {
    val parts = permission.key.split('.')
    if (parts.size != 2) return null
    val action = MatrixAction.entries.firstOrNull { it.key == parts[1] } ?: return null
    return parts[0] to action
}

/**
 * Same grouping as the web: `module.action` keys become module rows; other keys, and modules with a single key
 * (e.g. `audit.view`), are listed as special permissions.
 */
fun buildPermissionMatrix(catalogue: List<PermissionInfo>): PermissionMatrix {
    val byModule = LinkedHashMap<String, MutableMap<MatrixAction, PermissionInfo>>()
    val specials = mutableListOf<PermissionInfo>()
    catalogue.forEach { permission ->
        val parts = matrixParts(permission)
        if (parts == null) specials += permission else byModule.getOrPut(parts.first) { linkedMapOf() }[parts.second] = permission
    }
    val rows = mutableListOf<MatrixRow>()
    byModule.forEach { (module, cells) ->
        if (cells.size > 1) {
            rows += MatrixRow(module, NavigationCatalog.find(module)?.label ?: humanizeKey(module), cells)
        } else {
            specials += cells.values
        }
    }
    return PermissionMatrix(rows, specials)
}

fun columnKeys(rows: List<MatrixRow>, action: MatrixAction): List<String> = rows.mapNotNull { it.cells[action]?.key }

fun selectionState(selected: Set<String>, keys: List<String>): ToggleableState {
    val count = keys.count { it in selected }
    return when {
        count == 0 -> ToggleableState.Off
        count == keys.size -> ToggleableState.On
        else -> ToggleableState.Indeterminate
    }
}

/** Adds or removes [keys], keeping the existing order. */
fun setKeys(current: List<String>, keys: List<String>, on: Boolean): List<String> =
    if (on) current + keys.filterNot { it in current } else current.filterNot { it in keys.toSet() }
