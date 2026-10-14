package com.schoolapp.feature.inventory.detail

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.navigation.toRoute
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.inventory.PurchasingRepository
import com.schoolapp.feature.inventory.PurchaseRequestDestination
import com.schoolapp.feature.inventory.R
import com.schoolapp.feature.inventory.components.SavedMessage
import com.schoolapp.feature.inventory.shell.InventoryRights
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.receiveAsFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Loads the request, then its purchase order (totals, receipts, billing state); creates the vendor bill. */
@HiltViewModel
class PurchaseDetailViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val authRepository: AuthRepository,
    private val repository: PurchasingRepository,
    clock: AppClock,
) : ViewModel() {

    private val route = savedStateHandle.toRoute<PurchaseRequestDestination>()
    val requestId: String = route.requestId
    val schoolId: String? = route.schoolId
    val today: String = clock.now().toLocalDate().toString()

    private val _uiState = MutableStateFlow(PurchaseDetailUiState())
    val uiState: StateFlow<PurchaseDetailUiState> = _uiState.asStateFlow()

    private val _saved = Channel<SavedMessage>(Channel.BUFFERED)
    val saved: Flow<SavedMessage> = _saved.receiveAsFlow()

    private var job: Job? = null

    init {
        viewModelScope.launch {
            val session = authRepository.session.filterNotNull().first()
            _uiState.update {
                it.copy(rights = InventoryRights(canAdd = session.has("inventory.add"), canEdit = session.has("inventory.edit"), canBill = session.has("expenses.add")))
            }
        }
        load()
    }

    fun refresh() {
        _uiState.update { it.copy(isRefreshing = true) }
        load()
    }

    fun retry() {
        _uiState.update { it.copy(isLoading = true, error = null) }
        load()
    }

    fun askBill() = _uiState.update { it.copy(confirmBill = true, actionError = null) }

    fun dismissBill() = _uiState.update { it.copy(confirmBill = false) }

    fun dismissActionError() = _uiState.update { it.copy(actionError = null) }

    fun confirmBill() {
        val order = _uiState.value.order ?: return
        if (_uiState.value.isBilling) return
        _uiState.update { it.copy(confirmBill = false, isBilling = true, actionError = null) }
        viewModelScope.launch {
            when (val result = repository.bill(order.id)) {
                is AppResult.Success -> {
                    _uiState.update { it.copy(isBilling = false) }
                    _saved.send(SavedMessage(R.string.inv_bill_saved))
                    load()
                }
                is AppResult.Failure -> _uiState.update { it.copy(isBilling = false, actionError = result.error) }
            }
        }
    }

    /** Reload after an order or receipt was saved from a sheet. */
    fun load() {
        job?.cancel()
        job = viewModelScope.launch {
            when (val result = repository.request(requestId)) {
                is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, isRefreshing = false, error = result.error) }
                is AppResult.Success -> {
                    val request = result.data
                    val order = request.order?.let { summary ->
                        when (val orderResult = repository.order(summary.id)) {
                            is AppResult.Success -> orderResult.data
                            is AppResult.Failure -> {
                                _uiState.update { it.copy(isLoading = false, isRefreshing = false, error = orderResult.error) }
                                return@launch
                            }
                        }
                    }
                    _uiState.update {
                        it.copy(isLoading = false, isRefreshing = false, error = null, request = request, order = order)
                    }
                }
            }
        }
    }
}
