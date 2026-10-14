package com.schoolapp.feature.inventory.items

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.inventory.InventoryRepository
import com.schoolapp.core.model.inventory.ItemCategory
import com.schoolapp.feature.inventory.R
import com.schoolapp.feature.inventory.components.SavedMessage
import com.schoolapp.feature.inventory.components.isConflict
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

/** Adds a catalogue item (shared by every branch of the school). */
@HiltViewModel
class ItemFormViewModel @Inject constructor(
    private val repository: InventoryRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(ItemFormState())
    val uiState: StateFlow<ItemFormState> = _uiState.asStateFlow()

    private val _saved = Channel<SavedMessage>(Channel.BUFFERED)
    val saved: Flow<SavedMessage> = _saved.receiveAsFlow()

    private var schoolId: String? = null

    fun open(schoolId: String?) {
        this.schoolId = schoolId
        _uiState.value = ItemFormState(open = true)
    }

    fun dismiss() {
        if (!_uiState.value.isSaving) _uiState.update { it.copy(open = false) }
    }

    fun onSku(value: String) = edit(ItemField.SKU) { it.copy(sku = value.take(SKU_MAX)) }
    fun onName(value: String) = edit(ItemField.NAME) { it.copy(name = value.take(NAME_MAX)) }
    fun onCategory(value: ItemCategory?) = edit(ItemField.CATEGORY) { it.copy(category = value) }
    fun onUnit(value: String) = edit(ItemField.UNIT) { it.copy(unit = value.take(UNIT_MAX)) }
    fun onReorder(value: String) = edit(ItemField.REORDER) { it.copy(reorderLevel = value) }
    fun onAsset(value: Boolean) = _uiState.update { it.copy(isAsset = value) }
    fun onSaleable(value: Boolean) = edit(ItemField.PRICE) { it.copy(saleable = value) }
    fun onPrice(value: String) = edit(ItemField.PRICE) { it.copy(salePrice = value) }

    fun submit() {
        val state = _uiState.value
        if (state.isSaving) return
        val errors = state.validate()
        if (errors.isNotEmpty()) {
            _uiState.update { it.copy(errors = errors) }
            return
        }
        _uiState.update { it.copy(isSaving = true, error = null) }
        viewModelScope.launch {
            when (val result = repository.createItem(state.toInput(schoolId))) {
                is AppResult.Success -> {
                    _uiState.update { it.copy(isSaving = false, open = false) }
                    _saved.send(SavedMessage(R.string.inv_item_saved, result.data.name))
                }
                is AppResult.Failure -> _uiState.update {
                    if (result.error.isConflict) {
                        it.copy(isSaving = false, errors = it.errors + (ItemField.SKU to R.string.inv_err_sku_taken))
                    } else {
                        it.copy(isSaving = false, error = result.error)
                    }
                }
            }
        }
    }

    private fun edit(field: ItemField, change: (ItemFormState) -> ItemFormState) =
        _uiState.update { change(it).copy(errors = it.errors - field, error = null) }

    private companion object {
        const val SKU_MAX = 40
        const val NAME_MAX = 120
        const val UNIT_MAX = 20
    }
}
