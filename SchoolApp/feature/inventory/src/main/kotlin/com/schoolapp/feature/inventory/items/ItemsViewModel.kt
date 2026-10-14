package com.schoolapp.feature.inventory.items

import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.inventory.InventoryRepository
import com.schoolapp.core.model.inventory.InventoryItem
import com.schoolapp.core.model.inventory.InventoryPage
import com.schoolapp.core.model.inventory.ItemCategory
import com.schoolapp.feature.inventory.list.PagedListViewModel
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class ItemFilters(val category: ItemCategory? = null, val search: String = "")

/** Item catalogue with this branch's stock, filtered by category and searched by name or SKU. */
@HiltViewModel
class ItemsViewModel @Inject constructor(
    private val repository: InventoryRepository,
) : PagedListViewModel<InventoryItem>() {

    private val _filters = MutableStateFlow(ItemFilters())
    val filters: StateFlow<ItemFilters> = _filters.asStateFlow()

    private var searchJob: Job? = null

    override suspend fun fetch(branchId: String, page: Int): AppResult<InventoryPage<InventoryItem>> {
        val current = _filters.value
        return repository.items(branchId, current.category, current.search, page)
    }

    fun onCategory(category: ItemCategory?) {
        if (category == _filters.value.category) return
        _filters.value = _filters.value.copy(category = category)
        reload()
    }

    fun onSearch(text: String) {
        _filters.value = _filters.value.copy(search = text.take(SEARCH_MAX))
        searchJob?.cancel()
        searchJob = viewModelScope.launch {
            delay(SEARCH_DEBOUNCE_MS)
            reload()
        }
    }

    private companion object {
        const val SEARCH_DEBOUNCE_MS = 350L
        const val SEARCH_MAX = 80
    }
}
