package com.schoolapp.feature.inventory.movements

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.inventory.InventoryRepository
import com.schoolapp.core.model.inventory.MovementType
import com.schoolapp.feature.inventory.R
import com.schoolapp.feature.inventory.components.SavedMessage
import com.schoolapp.feature.inventory.components.isNegativeStock
import com.schoolapp.feature.inventory.components.serverMessage
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

/** Records stock in, issue, adjustment or transfer for one branch. */
@HiltViewModel
class MovementFormViewModel @Inject constructor(
    private val repository: InventoryRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(MovementFormState())
    val uiState: StateFlow<MovementFormState> = _uiState.asStateFlow()

    private val _saved = Channel<SavedMessage>(Channel.BUFFERED)
    val saved: Flow<SavedMessage> = _saved.receiveAsFlow()

    private var branchId: String? = null

    fun open(branchId: String) {
        this.branchId = branchId
        _uiState.value = MovementFormState(open = true)
        viewModelScope.launch {
            val result = repository.stock(branchId)
            if (result is AppResult.Success && this@MovementFormViewModel.branchId == branchId) {
                _uiState.update { state -> state.copy(inStock = result.data.associate { it.item.id to it.quantity }) }
            }
        }
    }

    fun dismiss() {
        if (!_uiState.value.isSaving) _uiState.update { it.copy(open = false) }
    }

    fun onItem(id: String?) = edit(MovementField.ITEM) { it.copy(itemId = id) }

    fun onType(type: MovementType) = _uiState.update {
        it.copy(type = type, errors = it.errors - MovementField.TO_BRANCH - MovementField.REASON, quantityServerError = null)
    }

    fun onRemove(remove: Boolean) = _uiState.update { it.copy(remove = remove, quantityServerError = null) }

    fun onQuantity(value: String) = edit(MovementField.QUANTITY) { it.copy(quantity = value, quantityServerError = null) }

    fun onToBranch(id: String?) = edit(MovementField.TO_BRANCH) { it.copy(toBranchId = id) }

    fun onIssuedTo(value: String) = _uiState.update { it.copy(issuedTo = value.take(ISSUED_TO_MAX)) }

    fun onReason(value: String) = edit(MovementField.REASON) { it.copy(reason = value.take(REASON_MAX)) }

    fun submit() {
        val state = _uiState.value
        val branch = branchId ?: return
        if (state.isSaving) return
        val errors = state.validate()
        if (errors.isNotEmpty()) {
            _uiState.update { it.copy(errors = errors) }
            return
        }
        _uiState.update { it.copy(isSaving = true, error = null, quantityServerError = null) }
        viewModelScope.launch {
            when (val result = repository.recordMovement(state.toInput(branch))) {
                is AppResult.Success -> {
                    _uiState.update { it.copy(isSaving = false, open = false) }
                    _saved.send(SavedMessage(R.string.inv_movement_saved))
                }
                is AppResult.Failure -> _uiState.update {
                    val message = result.error.serverMessage
                    if (result.error.isNegativeStock && message != null) {
                        it.copy(isSaving = false, quantityServerError = message)
                    } else {
                        it.copy(isSaving = false, error = result.error)
                    }
                }
            }
        }
    }

    private fun edit(field: MovementField, change: (MovementFormState) -> MovementFormState) =
        _uiState.update { change(it).copy(errors = it.errors - field, error = null) }

    private companion object {
        const val ISSUED_TO_MAX = 120
        const val REASON_MAX = 500
    }
}
