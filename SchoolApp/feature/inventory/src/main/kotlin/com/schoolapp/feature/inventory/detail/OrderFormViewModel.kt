package com.schoolapp.feature.inventory.detail

import androidx.compose.runtime.Immutable
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.inventory.PurchasingRepository
import com.schoolapp.core.designsystem.money.MoneyFormat
import com.schoolapp.core.model.inventory.PricedLine
import com.schoolapp.core.model.inventory.PurchaseOrderInput
import com.schoolapp.core.model.inventory.PurchaseRequest
import com.schoolapp.core.model.inventory.Vendor
import com.schoolapp.feature.inventory.R
import com.schoolapp.feature.inventory.components.LineDraft
import com.schoolapp.feature.inventory.components.SavedMessage
import com.schoolapp.feature.inventory.components.check
import com.schoolapp.feature.inventory.components.edit
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.receiveAsFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Rows keep the request's items; only quantity and agreed price change. [names] labels each row. */
@Immutable
data class OrderFormState(
    val open: Boolean = false,
    val vendors: List<Vendor> = emptyList(),
    val vendorsLoading: Boolean = false,
    val vendorId: String? = null,
    val vendorError: Boolean = false,
    val isCreatingVendor: Boolean = false,
    val expectedOn: String = "",
    val lines: List<LineDraft> = emptyList(),
    val names: Map<String, String> = emptyMap(),
    val isSaving: Boolean = false,
    val error: AppError? = null,
) {
    val totalMinor: Long get() = lines.sumOf { it.totalMinor }
}

/** "Create purchase order" from an approved request: vendor (pick or add), expected date, agreed prices. */
@HiltViewModel
class OrderFormViewModel @Inject constructor(
    private val repository: PurchasingRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(OrderFormState())
    val uiState: StateFlow<OrderFormState> = _uiState.asStateFlow()

    private val _saved = Channel<SavedMessage>(Channel.BUFFERED)
    val saved: Flow<SavedMessage> = _saved.receiveAsFlow()

    private var requestId: String? = null
    private var schoolId: String? = null

    fun open(request: PurchaseRequest, schoolId: String?) {
        requestId = request.id
        this.schoolId = schoolId
        _uiState.value = OrderFormState(
            open = true,
            vendorsLoading = true,
            lines = request.lines.mapIndexed { index, line ->
                LineDraft(index + 1, line.itemId, line.quantity.toString(), MoneyFormat.toInput(line.estimatedUnitMinor))
            },
            names = request.lines.associate { it.itemId to it.itemName },
        )
        viewModelScope.launch {
            val result = repository.vendors(request.branchId)
            _uiState.update {
                when (result) {
                    is AppResult.Success -> it.copy(vendorsLoading = false, vendors = result.data)
                    is AppResult.Failure -> it.copy(vendorsLoading = false, error = result.error)
                }
            }
        }
    }

    fun dismiss() {
        if (!_uiState.value.isSaving) _uiState.update { it.copy(open = false) }
    }

    fun onVendor(id: String?) = _uiState.update { it.copy(vendorId = id, vendorError = false, error = null) }

    fun createVendor(name: String) {
        if (_uiState.value.isCreatingVendor || name.trim().length < VENDOR_NAME_MIN) return
        _uiState.update { it.copy(isCreatingVendor = true, error = null) }
        viewModelScope.launch {
            when (val result = repository.createVendor(name, schoolId)) {
                is AppResult.Success -> _uiState.update {
                    it.copy(isCreatingVendor = false, vendors = (it.vendors + result.data).sortedBy { v -> v.name.lowercase() }, vendorId = result.data.id, vendorError = false)
                }
                is AppResult.Failure -> _uiState.update { it.copy(isCreatingVendor = false, error = result.error) }
            }
        }
    }

    fun onExpectedOn(date: String) = _uiState.update { it.copy(expectedOn = date) }

    fun onQuantity(key: Int, value: String) = editLine(key) { it.copy(quantity = value, quantityError = null) }

    fun onPrice(key: Int, value: String) = editLine(key) { it.copy(price = value, priceError = null) }

    fun submit() {
        val state = _uiState.value
        val request = requestId ?: return
        if (state.isSaving) return
        val checked = state.lines.check(needsPrice = true)
        val vendor = state.vendorId
        if (!checked.valid || vendor == null) {
            _uiState.update { it.copy(lines = checked.lines, vendorError = vendor == null) }
            return
        }
        val input = PurchaseOrderInput(
            vendorId = vendor,
            lines = state.lines.map { PricedLine(it.itemId.orEmpty(), it.quantityValue ?: 0, it.priceMinor ?: 0L) },
            expectedOn = state.expectedOn.takeIf { it.isNotBlank() },
        )
        _uiState.update { it.copy(isSaving = true, error = null) }
        viewModelScope.launch {
            when (val result = repository.createOrder(request, input)) {
                is AppResult.Success -> {
                    _uiState.update { it.copy(isSaving = false, open = false) }
                    _saved.send(SavedMessage(R.string.inv_order_saved))
                }
                is AppResult.Failure -> _uiState.update { it.copy(isSaving = false, error = result.error) }
            }
        }
    }

    private fun editLine(key: Int, change: (LineDraft) -> LineDraft) =
        _uiState.update { it.copy(lines = it.lines.edit(key, change), error = null) }

    private companion object {
        const val VENDOR_NAME_MIN = 2
    }
}
