package com.schoolapp.feature.inventory.assets

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.inventory.InventoryRepository
import com.schoolapp.core.model.inventory.Asset
import com.schoolapp.core.model.inventory.InventoryPage
import com.schoolapp.feature.inventory.list.PagedListViewModel
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject

/** Tagged assets (furniture, computers …) of the branch. */
@HiltViewModel
class AssetsViewModel @Inject constructor(
    private val repository: InventoryRepository,
) : PagedListViewModel<Asset>() {
    override suspend fun fetch(branchId: String, page: Int): AppResult<InventoryPage<Asset>> =
        repository.assets(branchId, page)
}
