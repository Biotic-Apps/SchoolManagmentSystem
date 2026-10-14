package com.schoolapp.feature.students.detail.pickup

import androidx.compose.runtime.Immutable
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.pickup.PickupRepository
import com.schoolapp.core.data.students.detail.StudentDetailExtrasRepository
import com.schoolapp.core.model.pickup.PickupPerson
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

internal enum class PickupAction { VERIFY, REVOKE }

/** A verify / revoke waiting for confirmation. */
internal data class PickupConfirm(val person: PickupPerson, val action: PickupAction, val busy: Boolean = false)


@Immutable
internal data class StudentPickupUiState(
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val persons: List<PickupPerson> = emptyList(),
    val error: AppError? = null,
    val confirm: PickupConfirm? = null,
    /** A failed verify / revoke, shown once in the snackbar. */
    val actionError: AppError? = null,
)

/** Pickup tab: authorised persons of the student; office staff (`pickup.edit`) verify or revoke them. */
@HiltViewModel
internal class StudentPickupViewModel @Inject constructor(
    private val pickup: PickupRepository,
    private val extras: StudentDetailExtrasRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(StudentPickupUiState())
    val uiState: StateFlow<StudentPickupUiState> = _uiState.asStateFlow()

    private val _messages = Channel<PickupAction>(Channel.BUFFERED)
    val messages: Flow<PickupAction> = _messages.receiveAsFlow()

    private var studentId: String? = null

    fun start(id: String) {
        if (studentId == id) return
        studentId = id
        load()
    }

    fun load(refresh: Boolean = false) {
        val id = studentId ?: return
        _uiState.update { it.copy(isLoading = !refresh && it.persons.isEmpty(), isRefreshing = refresh, error = null) }
        viewModelScope.launch {
            val result = pickup.pickupPersons(id)
            _uiState.update { state ->
                when (result) {
                    is AppResult.Success -> state.copy(isLoading = false, isRefreshing = false, persons = result.data)
                    is AppResult.Failure -> state.copy(isLoading = false, isRefreshing = false, error = result.error)
                }
            }
        }
    }

    fun consumeActionError() = _uiState.update { it.copy(actionError = null) }

    fun ask(person: PickupPerson, action: PickupAction) = _uiState.update { it.copy(confirm = PickupConfirm(person, action)) }

    fun dismiss() {
        if (_uiState.value.confirm?.busy == true) return
        _uiState.update { it.copy(confirm = null) }
    }

    fun confirm() {
        val confirm = _uiState.value.confirm ?: return
        if (confirm.busy) return
        _uiState.update { it.copy(confirm = confirm.copy(busy = true)) }
        viewModelScope.launch {
            val result = when (confirm.action) {
                PickupAction.VERIFY -> extras.verifyPickupPerson(confirm.person.id)
                PickupAction.REVOKE -> extras.revokePickupPerson(confirm.person.id)
            }
            when (result) {
                is AppResult.Success -> {
                    _uiState.update { s -> s.copy(confirm = null, persons = s.persons.map { if (it.id == result.data.id) result.data else it }) }
                    _messages.send(confirm.action)
                }
                is AppResult.Failure -> _uiState.update { it.copy(confirm = null, actionError = result.error) }
            }
        }
    }
}
