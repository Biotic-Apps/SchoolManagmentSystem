package com.schoolapp.feature.inventory.shell

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.inventory.InventoryItem
import com.schoolapp.core.model.organisation.BranchOption

/** What the signed-in role may do here (the API enforces the same keys). */
@Immutable
data class InventoryRights(
    /** `inventory.add`: add items, raise purchase requests, add vendors. */
    val canAdd: Boolean = false,
    /** `inventory.edit`: movements, assets, purchase orders and receiving. */
    val canEdit: Boolean = false,
    /** `expenses.add`: turn a purchase order into a vendor bill. */
    val canBill: Boolean = false,
    /** `fees.add`: sell items to students (Student sales tab). */
    val canSell: Boolean = false,
)

enum class InventoryTab { STOCK, ITEMS, MOVEMENTS, ASSETS, PURCHASING, SALES }

/**
 * Branch scope plus the branch's item catalogue shared by every tab. [version] goes up after each save
 * so every tab reloads what it shows.
 */
@Immutable
data class InventoryShellState(
    val isLoading: Boolean = true,
    val error: AppError? = null,
    val branches: List<BranchOption> = emptyList(),
    val branchId: String? = null,
    val rights: InventoryRights = InventoryRights(),
    val catalog: List<InventoryItem> = emptyList(),
    val version: Int = 0,
    /** Global roles switch branch; branch-bound roles stay on their own (others are transfer targets). */
    val canPickBranch: Boolean = false,
) {
    val schoolId: String? get() = branches.firstOrNull { it.id == branchId }?.schoolId
    val showBranchPicker: Boolean get() = canPickBranch && branches.size > 1
    val tabs: List<InventoryTab>
        get() = InventoryTab.entries.filter { it != InventoryTab.SALES || rights.canSell }
    val otherBranches: List<BranchOption> get() = branches.filter { it.id != branchId }
}
