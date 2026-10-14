package com.schoolapp.feature.inventory.assets

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.inventory.InventoryRepository
import com.schoolapp.core.model.inventory.Asset
import com.schoolapp.core.model.inventory.AssetCondition
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

@HiltViewModel
class AssetFormViewModel @Inject constructor(
    private val repository: InventoryRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(AssetFormState())
    val uiState: StateFlow<AssetFormState> = _uiState.asStateFlow()

    private val _saved = Channel<SavedMessage>(Channel.BUFFERED)
    val saved: Flow<SavedMessage> = _saved.receiveAsFlow()

    private var branchId: String? = null

    /** [asset] null adds a new asset in [branchId]. */
    fun open(branchId: String, asset: Asset?) {
        this.branchId = branchId
        _uiState.value = AssetFormState.from(asset)
    }

    fun dismiss() {
        if (!_uiState.value.isSaving) _uiState.update { it.copy(open = false) }
    }

    fun onItem(id: String?) = edit(AssetField.ITEM) { it.copy(itemId = id) }
    fun onTag(value: String) = edit(AssetField.TAG) { it.copy(tag = value.take(TAG_MAX)) }
    fun onLocation(value: String) = edit(AssetField.LOCATION) { it.copy(location = value.take(TEXT_MAX)) }
    fun onCondition(value: AssetCondition) = _uiState.update { it.copy(condition = value) }
    fun onAssignedTo(value: String) = _uiState.update { it.copy(assignedTo = value.take(TEXT_MAX)) }

    fun submit() {
        val state = _uiState.value
        val branch = branchId ?: return
        if (state.isSaving) return
        val errors = state.validate()
        if (errors.isNotEmpty()) {
            _uiState.update { it.copy(errors = errors) }
            return
        }
        _uiState.update { it.copy(isSaving = true, error = null) }
        viewModelScope.launch {
            val editing = state.editing
            val result = if (editing == null) {
                repository.createAsset(branch, state.toInput())
            } else {
                repository.updateAsset(editing.id, state.toInput())
            }
            when (result) {
                is AppResult.Success -> {
                    _uiState.update { it.copy(isSaving = false, open = false) }
                    _saved.send(SavedMessage(if (editing == null) R.string.inv_asset_added else R.string.inv_asset_updated))
                }
                is AppResult.Failure -> _uiState.update {
                    if (result.error.isConflict && editing == null) {
                        it.copy(isSaving = false, errors = it.errors + (AssetField.TAG to R.string.inv_err_tag_taken))
                    } else {
                        it.copy(isSaving = false, error = result.error)
                    }
                }
            }
        }
    }

    private fun edit(field: AssetField, change: (AssetFormState) -> AssetFormState) =
        _uiState.update { change(it).copy(errors = it.errors - field, error = null) }

    private companion object {
        const val TAG_MAX = 40
        const val TEXT_MAX = 120
    }
}
