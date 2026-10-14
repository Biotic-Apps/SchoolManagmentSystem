package com.schoolapp.feature.admin.schools.setup

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.schools.SchoolsRepository
import com.schoolapp.feature.admin.common.AdminNotice
import com.schoolapp.feature.admin.common.AdminNotices
import com.schoolapp.feature.admin.schools.SchoolPermissions
import com.schoolapp.feature.admin.schools.setup.model.SetupForm
import com.schoolapp.feature.admin.schools.setup.model.SetupServerErrors
import com.schoolapp.feature.admin.schools.setup.model.SetupStep
import com.schoolapp.feature.admin.schools.setup.model.SetupValidation
import com.schoolapp.feature.admin.schools.setup.model.toInput
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** One form across the steps: Next validates the step, Back keeps values, server errors jump to their step. */
@HiltViewModel
class SetupViewModel @Inject constructor(
    private val repository: SchoolsRepository,
    authRepository: AuthRepository,
    private val notices: AdminNotices,
) : ViewModel() {

    private val _uiState = MutableStateFlow(SetupUiState())
    val uiState: StateFlow<SetupUiState> = _uiState.asStateFlow()

    /** Field edits for each step (kept in their own class so this file stays about the flow). */
    val edits = SetupFormEdits(::updateForm)

    init {
        viewModelScope.launch {
            val canSetup = SchoolPermissions.of(authRepository.session.first()).canSetup
            _uiState.update { it.copy(canSetup = canSetup) }
        }
    }

    fun goTo(target: SetupStep) {
        val state = _uiState.value
        if (state.isSubmitting) return
        _uiState.update { it.copy(banner = null, bannerRes = null, genericError = false) }
        if (target.ordinal <= state.step.ordinal) {
            _uiState.update { it.copy(step = target) }
            return
        }
        // Validate every step on the way; stop on the first one with problems.
        var errors = state.errors.filterKeys { key -> SetupStep.entries.none { it.ordinal in state.step.ordinal until target.ordinal && it.owns(key) } }
        var stop = target
        for (step in SetupStep.entries.filter { it.ordinal in state.step.ordinal until target.ordinal }) {
            val found = SetupValidation.step(step, state.form)
            if (found.isNotEmpty()) {
                errors = errors + found
                stop = step
                break
            }
        }
        _uiState.update {
            it.copy(step = stop, errors = errors, reached = if (stop.ordinal > it.reached.ordinal) stop else it.reached)
        }
    }

    fun next() {
        val state = _uiState.value
        if (state.isReview) submit() else goTo(SetupStep.entries[state.step.ordinal + 1])
    }

    fun back() {
        val step = _uiState.value.step
        if (step.ordinal > 0) _uiState.update { it.copy(step = SetupStep.entries[step.ordinal - 1], banner = null, bannerRes = null) }
    }

    private fun submit() {
        val state = _uiState.value
        if (state.isSubmitting) return
        val errors = SetupValidation.all(state.form)
        if (errors.isNotEmpty()) {
            val first = errors.keys.mapNotNull(SetupStep::forKey).minByOrNull { it.ordinal } ?: SetupStep.SCHOOL
            _uiState.update { it.copy(errors = errors, step = first) }
            return
        }
        _uiState.update { it.copy(isSubmitting = true, banner = null, bannerRes = null, genericError = false) }
        viewModelScope.launch {
            when (val result = repository.setup(state.form.toInput())) {
                is AppResult.Success -> {
                    notices.post(AdminNotice(AdminNotice.Kind.SCHOOL_CREATED, result.data.schoolName))
                    _uiState.update { it.copy(isSubmitting = false, result = result.data) }
                }
                is AppResult.Failure -> {
                    val failure = SetupServerErrors.map(result.error)
                    _uiState.update {
                        it.copy(
                            isSubmitting = false,
                            errors = it.errors + failure.fields,
                            step = failure.step ?: it.step,
                            banner = failure.banner,
                            bannerRes = failure.bannerRes,
                            genericError = failure.fields.isEmpty() && failure.banner == null && failure.bannerRes == null,
                        )
                    }
                }
            }
        }
    }

    /** Applies an edit; once a step shows errors they are re-checked as the admin types. */
    private fun updateForm(change: (SetupForm) -> SetupForm) = _uiState.update { state ->
        val form = change(state.form)
        val step = state.step
        val stepErrors = state.errors.filterKeys(step::owns)
        val errors = if (stepErrors.isEmpty()) state.errors else state.errors.filterKeys { !step.owns(it) } + SetupValidation.step(step, form)
        state.copy(form = form, errors = errors, isDirty = true, genericError = false)
    }
}
