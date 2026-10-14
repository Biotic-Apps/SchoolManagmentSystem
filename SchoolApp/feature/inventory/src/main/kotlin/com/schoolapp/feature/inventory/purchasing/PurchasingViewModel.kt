package com.schoolapp.feature.inventory.purchasing

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.inventory.PurchasingRepository
import com.schoolapp.core.model.inventory.InventoryPage
import com.schoolapp.core.model.inventory.PurchaseRequest
import com.schoolapp.core.model.inventory.PurchaseRequestStatus
import com.schoolapp.feature.inventory.list.PagedListViewModel
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import javax.inject.Inject

/** Purchase requests of the branch, filterable by status (web "Purchasing" tab). */
@HiltViewModel
class PurchasingViewModel @Inject constructor(
    private val repository: PurchasingRepository,
) : PagedListViewModel<PurchaseRequest>() {

    private val _status = MutableStateFlow<PurchaseRequestStatus?>(null)
    val status: StateFlow<PurchaseRequestStatus?> = _status.asStateFlow()

    override suspend fun fetch(branchId: String, page: Int): AppResult<InventoryPage<PurchaseRequest>> =
        repository.requests(branchId, _status.value, page)

    fun onStatus(status: PurchaseRequestStatus?) {
        if (status == _status.value) return
        _status.value = status
        reload()
    }
}
