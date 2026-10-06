package com.schoolapp.feature.activities.propose

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.activities.ActivitiesRepository
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.organisation.ScopedSections
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.model.activity.ActivityInput
import com.schoolapp.core.model.activity.ActivityType
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Teacher proposes an activity; it goes to the principal as PROPOSED. */
@HiltViewModel
class ProposeActivityViewModel @Inject constructor(
    private val repository: ActivitiesRepository,
    private val scopedSections: ScopedSections,
    private val authRepository: AuthRepository,
    clock: AppClock,
) : ViewModel() {

    private val _uiState = MutableStateFlow(ProposeActivityUiState(today = clock.now().toLocalDate().toString()))
    val uiState: StateFlow<ProposeActivityUiState> = _uiState.asStateFlow()

    private var attempted = false

    init {
        loadSections()
    }

    fun loadSections() {
        _uiState.update { it.copy(sectionsLoading = true, sectionsError = null) }
        viewModelScope.launch {
            when (val result = scopedSections.load()) {
                is AppResult.Failure -> _uiState.update { it.copy(sectionsLoading = false, sectionsError = result.error) }
                is AppResult.Success -> {
                    val options = result.data.sortedWith(compareBy({ it.className }, { it.name }))
                        .map { SwitcherOption(it.id, listOfNotNull(it.className, it.name).joinToString(" - ")) }
                    _uiState.update { it.copy(sectionsLoading = false, sections = options) }
                }
            }
        }
    }

    fun onTypeChange(type: ActivityType) = edit { it.copy(type = type) }
    fun onTitleChange(value: String) = edit { it.copy(title = value) }
    fun onDescriptionChange(value: String) = edit { it.copy(description = value) }
    fun onDateChange(value: String) = edit { it.copy(date = value) }
    fun onStartTimeChange(value: String) = edit { it.copy(startTime = value) }
    fun onEndTimeChange(value: String) = edit { it.copy(endTime = value) }
    fun onVenueChange(value: String) = edit { it.copy(venue = value) }
    fun onWholeBranchChange(value: Boolean) = edit { it.copy(wholeBranch = value) }
    fun onConsentRequiredChange(value: Boolean) = edit { it.copy(consentRequired = value) }
    fun onDeadlineChange(value: String) = edit { it.copy(consentDeadline = value) }

    fun onSectionToggle(sectionId: String) = edit {
        it.copy(sectionIds = if (sectionId in it.sectionIds) it.sectionIds - sectionId else it.sectionIds + sectionId)
    }

    fun submit() {
        val state = _uiState.value
        if (state.isSubmitting || state.submitted) return
        attempted = true
        val errors = ProposeValidation.validate(state.form, state.today)
        _uiState.update { it.copy(errors = errors, submitError = null) }
        if (errors.isNotEmpty()) return
        _uiState.update { it.copy(isSubmitting = true) }
        viewModelScope.launch {
            val input = state.form.toInput(authRepository.session.first()?.activeBranchId)
            when (val result = repository.propose(input)) {
                is AppResult.Failure -> _uiState.update { it.copy(isSubmitting = false, submitError = result.error) }
                is AppResult.Success -> _uiState.update { it.copy(isSubmitting = false, submitted = true) }
            }
        }
    }

    private fun ProposeForm.toInput(branchId: String?) = ActivityInput(
        branchId = branchId,
        type = type,
        title = title.trim(),
        description = description.trim(),
        startAt = "${date}T$startTime",
        endAt = "${date}T$endTime",
        venue = venue.trim().ifEmpty { null },
        sectionIds = if (wholeBranch) emptyList() else sectionIds.toList(),
        wholeBranch = wholeBranch,
        consentRequired = consentRequired,
        consentDeadline = consentDeadline.takeIf { consentRequired },
    )

    private fun edit(transform: (ProposeForm) -> ProposeForm) = _uiState.update { state ->
        val form = transform(state.form)
        state.copy(form = form, errors = if (attempted) ProposeValidation.validate(form, state.today) else state.errors)
    }
}
