package com.schoolapp.feature.settings.notifications

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.settings.SettingsRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Notification channels form plus the WhatsApp message log of one school. */
@HiltViewModel
internal class NotificationsViewModel @Inject constructor(
    private val repository: SettingsRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(NotificationsUiState())
    val uiState: StateFlow<NotificationsUiState> = _uiState.asStateFlow()

    private var schoolId: String? = null
    private var loadJob: Job? = null
    private var logJob: Job? = null

    fun bind(id: String) {
        if (schoolId == id) return
        schoolId = id
        load(refreshing = false)
        loadLog()
    }

    fun retry() = load(refreshing = false)

    fun refresh() {
        if (!_uiState.value.dirty) load(refreshing = true)
        loadLog()
    }

    fun edit(transform: (NotificationForm) -> NotificationForm) = _uiState.update { state ->
        val form = transform(state.form)
        state.copy(form = form, saved = false, saveError = null, problems = problemsOf(form).intersect(state.problems), serverErrors = emptyMap())
    }

    fun discard() = _uiState.update { it.copy(form = it.initial, problems = emptySet(), serverErrors = emptyMap(), saveError = null) }

    fun save() {
        val state = _uiState.value
        val id = schoolId ?: return
        if (state.saving || !state.dirty) return
        val problems = problemsOf(state.form)
        if (problems.isNotEmpty()) {
            _uiState.update { it.copy(problems = problems) }
            return
        }
        _uiState.update { it.copy(saving = true, saved = false, saveError = null, serverErrors = emptyMap()) }
        viewModelScope.launch {
            val submitted = state.form
            val result = repository.saveNotifications(id, submitted.toSettings())
            _uiState.update { current ->
                when (result) {
                    is AppResult.Success -> {
                        val form = result.data?.let { NotificationForm.from(it) } ?: submitted
                        current.copy(saving = false, saved = true, initial = form, form = form)
                    }
                    is AppResult.Failure -> current.copy(
                        saving = false,
                        saveError = result.error,
                        serverErrors = (result.error as? AppError.Validation)?.fields.orEmpty(),
                    )
                }
            }
        }
    }

    fun filterLog(status: String?) {
        _uiState.update { it.copy(log = it.log.copy(status = status, page = 1)) }
        loadLog()
    }

    fun logPage(page: Int) {
        _uiState.update { it.copy(log = it.log.copy(page = page)) }
        loadLog()
    }

    fun retryLog() = loadLog()

    private fun problemsOf(form: NotificationForm): Set<NotificationProblem> = buildSet {
        if (form.emailEnabled && form.emailFromName.isBlank()) add(NotificationProblem.FROM_NAME_REQUIRED)
        if (form.smsEnabled && form.smsSenderId.isBlank()) add(NotificationProblem.SENDER_ID_REQUIRED)
    }

    private fun load(refreshing: Boolean) {
        val id = schoolId ?: return
        loadJob?.cancel()
        loadJob = viewModelScope.launch {
            _uiState.update { it.copy(isLoading = !refreshing && !it.loaded, isRefreshing = refreshing, error = null) }
            val result = repository.notifications(id)
            _uiState.update { state ->
                val base = state.copy(isLoading = false, isRefreshing = false)
                when (result) {
                    is AppResult.Success -> {
                        val form = NotificationForm.from(result.data)
                        base.copy(loaded = true, initial = form, form = form, problems = emptySet(), serverErrors = emptyMap())
                    }
                    is AppResult.Failure -> base.copy(error = result.error)
                }
            }
        }
    }

    private fun loadLog() {
        val id = schoolId ?: return
        logJob?.cancel()
        logJob = viewModelScope.launch {
            _uiState.update { it.copy(log = it.log.copy(isLoading = true, error = null)) }
            val log = _uiState.value.log
            val result = repository.whatsAppMessages(id, log.status, log.page, WhatsAppLogState.PAGE_SIZE)
            _uiState.update { state ->
                val next = state.log.copy(isLoading = false)
                state.copy(
                    log = when (result) {
                        is AppResult.Success -> next.copy(result = result.data)
                        is AppResult.Failure -> next.copy(error = result.error)
                    },
                )
            }
        }
    }
}
