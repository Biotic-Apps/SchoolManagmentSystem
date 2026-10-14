package com.schoolapp.feature.inventory.detail

import androidx.compose.runtime.Immutable
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.inventory.PurchasingRepository
import com.schoolapp.core.model.inventory.PurchaseOrder
import com.schoolapp.core.model.inventory.QuantityLine
import com.schoolapp.core.model.inventory.ReceiveInput
import com.schoolapp.feature.inventory.R
import com.schoolapp.feature.inventory.components.SavedMessage
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

@Immutable
data class ReceiveLine(
    val itemId: String,
    val name: String,
    val unit: String,
    val outstanding: Int,
    val quantity: String,
    val error: Int? = null,
)

@Immutable
data class ReceiveFormState(
    val open: Boolean = false,
    val poNo: String = "",
    val today: String = "",
    val receivedOn: String = "",
    val lines: List<ReceiveLine> = emptyList(),
    val linesError: Int? = null,
    val isSaving: Boolean = false,
    val error: AppError? = null,
)

/** Goods receipt against a purchase order; each line starts at its outstanding quantity (partial is fine). */
@HiltViewModel
class ReceiveFormViewModel @Inject constructor(
    private val repository: PurchasingRepository,
    private val clock: AppClock,
) : ViewModel() {

    private val _uiState = MutableStateFlow(ReceiveFormState())
    val uiState: StateFlow<ReceiveFormState> = _uiState.asStateFlow()

    private val _saved = Channel<SavedMessage>(Channel.BUFFERED)
    val saved: Flow<SavedMessage> = _saved.receiveAsFlow()

    private var orderId: String? = null

    fun open(order: PurchaseOrder) {
        orderId = order.id
        val today = clock.now().toLocalDate().toString()
        _uiState.value = ReceiveFormState(
            open = true,
            poNo = order.poNo,
            today = today,
            receivedOn = today,
            lines = order.lines.filter { it.outstanding > 0 }.map {
                ReceiveLine(it.itemId, it.itemName, it.unit, it.outstanding, it.outstanding.toString())
            },
        )
    }

    fun dismiss() {
        if (!_uiState.value.isSaving) _uiState.update { it.copy(open = false) }
    }

    fun onDate(date: String) = _uiState.update { it.copy(receivedOn = date) }

    fun onQuantity(itemId: String, value: String) = _uiState.update { state ->
        state.copy(
            lines = state.lines.map { if (it.itemId == itemId) it.copy(quantity = value, error = null) else it },
            linesError = null,
            error = null,
        )
    }

    fun submit() {
        val state = _uiState.value
        val order = orderId ?: return
        if (state.isSaving) return
        val checked = state.lines.map { line ->
            val qty = line.quantity.trim().toIntOrNull()
            line.copy(
                error = when {
                    qty == null || qty < 0 -> R.string.inv_err_whole
                    qty > line.outstanding -> R.string.inv_err_receive_more
                    else -> null
                },
            )
        }
        val anyReceived = checked.any { (it.quantity.trim().toIntOrNull() ?: 0) > 0 }
        if (checked.any { it.error != null } || !anyReceived) {
            _uiState.update { it.copy(lines = checked, linesError = if (anyReceived) null else R.string.inv_err_receive_none) }
            return
        }
        val input = ReceiveInput(
            receivedOn = state.receivedOn,
            lines = checked.mapNotNull { line ->
                line.quantity.trim().toInt().takeIf { it > 0 }?.let { QuantityLine(line.itemId, it) }
            },
        )
        _uiState.update { it.copy(isSaving = true, error = null) }
        viewModelScope.launch {
            when (val result = repository.receive(order, input)) {
                is AppResult.Success -> {
                    _uiState.update { it.copy(isSaving = false, open = false) }
                    _saved.send(SavedMessage(R.string.inv_received_saved))
                }
                is AppResult.Failure -> _uiState.update { it.copy(isSaving = false, error = result.error) }
            }
        }
    }
}
