package com.schoolapp.feature.inventory.purchasing

import androidx.compose.runtime.Immutable
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.inventory.PurchasingRepository
import com.schoolapp.core.model.inventory.PricedLine
import com.schoolapp.core.model.inventory.PurchaseRequestInput
import com.schoolapp.feature.inventory.R
import com.schoolapp.feature.inventory.components.LineDraft
import com.schoolapp.feature.inventory.components.SavedMessage
import com.schoolapp.feature.inventory.components.check
import com.schoolapp.feature.inventory.components.edit
import com.schoolapp.feature.inventory.components.nextKey
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
data class RequestFormState(
    val open: Boolean = false,
    val lines: List<LineDraft> = listOf(LineDraft(key = 1)),
    val linesError: Int? = null,
    val reason: String = "",
    val reasonError: Int? = null,
    val isSaving: Boolean = false,
    val error: AppError? = null,
) {
    val totalMinor: Long get() = lines.sumOf { it.totalMinor }
}

/** "New purchase request": items with estimated prices and a reason; it goes to Approvals. */
@HiltViewModel
class RequestFormViewModel @Inject constructor(
    private val repository: PurchasingRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(RequestFormState())
    val uiState: StateFlow<RequestFormState> = _uiState.asStateFlow()

    private val _saved = Channel<SavedMessage>(Channel.BUFFERED)
    val saved: Flow<SavedMessage> = _saved.receiveAsFlow()

    private var branchId: String? = null

    fun open(branchId: String) {
        this.branchId = branchId
        _uiState.value = RequestFormState(open = true)
    }

    fun dismiss() {
        if (!_uiState.value.isSaving) _uiState.update { it.copy(open = false) }
    }

    fun addLine() = _uiState.update { it.copy(lines = it.lines + LineDraft(it.lines.nextKey()), linesError = null) }

    fun removeLine(key: Int) = _uiState.update { state ->
        if (state.lines.size <= 1) state else state.copy(lines = state.lines.filterNot { it.key == key }, linesError = null)
    }

    fun onItem(key: Int, id: String?) = editLine(key) { it.copy(itemId = id, itemError = null) }
    fun onQuantity(key: Int, value: String) = editLine(key) { it.copy(quantity = value, quantityError = null) }
    fun onPrice(key: Int, value: String) = editLine(key) { it.copy(price = value, priceError = null) }
    fun onReason(value: String) = _uiState.update { it.copy(reason = value.take(REASON_MAX), reasonError = null, error = null) }

    fun submit() {
        val state = _uiState.value
        val branch = branchId ?: return
        if (state.isSaving) return
        val checked = state.lines.check(needsPrice = true)
        val reasonError = if (state.reason.trim().length < REASON_MIN) R.string.inv_err_reason else null
        if (!checked.valid || reasonError != null) {
            _uiState.update { it.copy(lines = checked.lines, linesError = checked.listError, reasonError = reasonError) }
            return
        }
        val input = PurchaseRequestInput(
            branchId = branch,
            lines = state.lines.map { PricedLine(it.itemId.orEmpty(), it.quantityValue ?: 0, it.priceMinor ?: 0L) },
            reason = state.reason.trim(),
        )
        _uiState.update { it.copy(isSaving = true, error = null) }
        viewModelScope.launch {
            when (val result = repository.createRequest(input)) {
                is AppResult.Success -> {
                    _uiState.update { it.copy(isSaving = false, open = false) }
                    _saved.send(SavedMessage(R.string.inv_request_saved))
                }
                is AppResult.Failure -> _uiState.update { it.copy(isSaving = false, error = result.error) }
            }
        }
    }

    private fun editLine(key: Int, change: (LineDraft) -> LineDraft) =
        _uiState.update { it.copy(lines = it.lines.edit(key, change), linesError = null, error = null) }

    private companion object {
        const val REASON_MIN = 3
        const val REASON_MAX = 1000
    }
}
