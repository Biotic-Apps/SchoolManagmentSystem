package com.schoolapp.feature.inventory.movements

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.inventory.InventoryRepository
import com.schoolapp.core.model.inventory.InventoryPage
import com.schoolapp.core.model.inventory.StockMovement
import com.schoolapp.feature.inventory.list.PagedListViewModel
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject

/** Movement history of the branch, newest first. */
@HiltViewModel
class MovementsViewModel @Inject constructor(
    private val repository: InventoryRepository,
) : PagedListViewModel<StockMovement>() {
    override suspend fun fetch(branchId: String, page: Int): AppResult<InventoryPage<StockMovement>> =
        repository.movements(branchId, page)
}
