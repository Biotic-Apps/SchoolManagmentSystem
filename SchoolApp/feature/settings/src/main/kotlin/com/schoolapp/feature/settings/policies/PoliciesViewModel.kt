package com.schoolapp.feature.settings.policies

import androidx.compose.runtime.Immutable
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.settings.SettingsRepository
import com.schoolapp.core.model.settings.PolicySettings
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@Immutable
internal data class PoliciesUiState(
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val error: AppError? = null,
    val settings: PolicySettings? = null,
    val initial: PolicyForm = PolicyForm(),
    val form: PolicyForm = PolicyForm(),
    /** Shown only after a save attempt, then live while editing. */
    val problems: Map<String, PolicyProblem> = emptyMap(),
    val showProblems: Boolean = false,
    val serverErrors: Map<String, String> = emptyMap(),
    val saving: Boolean = false,
    val saved: Boolean = false,
    val saveError: AppError? = null,
) {
    val dirty: Boolean get() = form != initial
}

/** School policies form (security and school defaults). */
@HiltViewModel
internal class PoliciesViewModel @Inject constructor(
    private val repository: SettingsRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(PoliciesUiState())
    val uiState: StateFlow<PoliciesUiState> = _uiState.asStateFlow()

    private var schoolId: String? = null
    private var loadJob: Job? = null

    fun bind(id: String) {
        if (schoolId == id) return
        schoolId = id
        load(refreshing = false)
    }

    fun retry() = load(refreshing = false)

    fun refresh() {
        if (!_uiState.value.dirty) load(refreshing = true)
    }

    fun edit(transform: (PolicyForm) -> PolicyForm) = _uiState.update { state ->
        val form = transform(state.form)
        state.copy(form = form, problems = form.problems(), saved = false, saveError = null, serverErrors = emptyMap())
    }

    fun discard() = _uiState.update {
        it.copy(form = it.initial, problems = emptyMap(), showProblems = false, serverErrors = emptyMap(), saveError = null)
    }

    fun save() {
        val state = _uiState.value
        val id = schoolId ?: return
        val current = state.settings ?: return
        if (state.saving || !state.dirty) return
        val problems = state.form.problems()
        if (problems.isNotEmpty()) {
            _uiState.update { it.copy(problems = problems, showProblems = true) }
            return
        }
        _uiState.update { it.copy(saving = true, saved = false, saveError = null, serverErrors = emptyMap()) }
        viewModelScope.launch {
            val submitted = state.form
            val result = repository.savePolicies(id, submitted.toSettings(current))
            _uiState.update { now ->
                when (result) {
                    is AppResult.Success -> {
                        val saved = result.data
                        val form = saved?.let { PolicyForm.from(it) } ?: submitted
                        now.copy(
                            saving = false,
                            saved = true,
                            settings = saved ?: submitted.toSettings(current),
                            initial = form,
                            form = form,
                            showProblems = false,
                        )
                    }
                    is AppResult.Failure -> now.copy(
                        saving = false,
                        saveError = result.error,
                        serverErrors = (result.error as? AppError.Validation)?.fields.orEmpty(),
                    )
                }
            }
        }
    }

    private fun load(refreshing: Boolean) {
        val id = schoolId ?: return
        loadJob?.cancel()
        loadJob = viewModelScope.launch {
            _uiState.update { it.copy(isLoading = !refreshing && it.settings == null, isRefreshing = refreshing, error = null) }
            val result = repository.policies(id)
            _uiState.update { state ->
                val base = state.copy(isLoading = false, isRefreshing = false)
                when (result) {
                    is AppResult.Success -> {
                        val form = PolicyForm.from(result.data)
                        base.copy(settings = result.data, initial = form, form = form, problems = emptyMap(), showProblems = false)
                    }
                    is AppResult.Failure -> base.copy(error = result.error)
                }
            }
        }
    }
}
