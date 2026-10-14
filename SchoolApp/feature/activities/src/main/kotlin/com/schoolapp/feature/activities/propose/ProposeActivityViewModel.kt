package com.schoolapp.feature.activities.propose

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.activities.ActivitiesRepository
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.organisation.OrganisationRepository
import com.schoolapp.core.data.organisation.ScopedSections
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.model.activity.ActivityType
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.async
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Propose an activity (goes to the principal as PROPOSED), or edit one that is still PROPOSED. */
@HiltViewModel
class ProposeActivityViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val repository: ActivitiesRepository,
    private val scopedSections: ScopedSections,
    private val organisationRepository: OrganisationRepository,
    private val authRepository: AuthRepository,
    clock: AppClock,
) : ViewModel() {

    private val editId: String? = savedStateHandle["activityId"]
    private val _uiState = MutableStateFlow(
        ProposeActivityUiState(today = clock.now().toLocalDate().toString(), editingId = editId, isLoadingActivity = editId != null),
    )
    val uiState: StateFlow<ProposeActivityUiState> = _uiState.asStateFlow()

    private var attempted = false
    private var branchId: String? = null

    init {
        loadSections()
        if (editId != null) loadActivity()
    }

    fun loadActivity() {
        val id = editId ?: return
        _uiState.update { it.copy(isLoadingActivity = true, loadError = null) }
        viewModelScope.launch {
            when (val result = repository.activity(id)) {
                is AppResult.Failure -> _uiState.update { it.copy(isLoadingActivity = false, loadError = result.error) }
                is AppResult.Success -> {
                    branchId = result.data.branchId
                    _uiState.update { it.copy(isLoadingActivity = false, form = result.data.toForm()) }
                }
            }
        }
    }

    fun loadSections() {
        _uiState.update { it.copy(sectionsLoading = true, sectionsError = null) }
        viewModelScope.launch {
            val schoolId = authRepository.session.first()?.activeAssignments?.firstNotNullOfOrNull { it.schoolId }
            val classesCall = async { organisationRepository.classes(schoolId) }
            val sections = scopedSections.load()
            val classes = (classesCall.await() as? AppResult.Success)?.data.orEmpty()
            when (sections) {
                is AppResult.Failure -> _uiState.update { it.copy(sectionsLoading = false, sectionsError = sections.error) }
                is AppResult.Success -> {
                    val sectionList = sections.data.sortedWith(compareBy({ it.className }, { it.name }))
                    val classIds = sectionList.mapNotNull { it.classId }.toSet()
                    val classOptions = classes.filter { classIds.isEmpty() || it.id in classIds }
                        .sortedWith(compareBy({ it.levelOrder ?: Int.MAX_VALUE }, { it.name }))
                        .map { SwitcherOption(it.id, it.name) }
                    _uiState.update {
                        it.copy(
                            sectionsLoading = false,
                            classes = classOptions,
                            sections = sectionList.map { s -> SwitcherOption(s.id, listOfNotNull(s.className, s.name).joinToString(" - ")) },
                        )
                    }
                }
            }
        }
    }

    fun onTypeChange(type: ActivityType) = edit { it.copy(type = type) }
    fun onTitleChange(value: String) = edit { it.copy(title = value) }
    fun onDescriptionChange(value: String) = edit { it.copy(description = value) }
    fun onDateChange(value: String) = edit { it.copy(date = value) }
    fun onStartTimeChange(value: String) = edit { it.copy(startTime = value) }
    fun onEndDateChange(value: String) = edit { it.copy(endDate = value.takeIf { date -> date != it.date }) }
    fun onEndTimeChange(value: String) = edit { it.copy(endTime = value) }
    fun onVenueChange(value: String) = edit { it.copy(venue = value) }
    fun onWholeBranchChange(value: Boolean) = edit { it.copy(wholeBranch = value) }
    fun onConsentRequiredChange(value: Boolean) = edit { it.copy(consentRequired = value) }
    fun onDeadlineChange(value: String) = edit { it.copy(consentDeadline = value) }
    fun onFeeChange(value: String) = edit { it.copy(fee = value) }
    fun onMaxParticipantsChange(value: String) = edit { it.copy(maxParticipants = value.filter(Char::isDigit)) }

    fun onSectionToggle(sectionId: String) = edit {
        it.copy(sectionIds = if (sectionId in it.sectionIds) it.sectionIds - sectionId else it.sectionIds + sectionId)
    }

    fun onClassToggle(classId: String) = edit {
        it.copy(classIds = if (classId in it.classIds) it.classIds - classId else it.classIds + classId)
    }

    fun submit() {
        val state = _uiState.value
        if (state.isSubmitting || state.submitted || state.isLoadingActivity) return
        attempted = true
        val errors = ProposeValidation.validate(state.form, state.today, allowPast = state.isEditing)
        _uiState.update { it.copy(errors = errors, submitError = null) }
        if (errors.isNotEmpty()) return
        _uiState.update { it.copy(isSubmitting = true) }
        viewModelScope.launch {
            val id = state.editingId
            val result = if (id != null) {
                repository.update(id, state.form.toInput(branchId))
            } else {
                repository.propose(state.form.toInput(authRepository.session.first()?.activeBranchId))
            }
            when (result) {
                is AppResult.Failure -> _uiState.update { it.copy(isSubmitting = false, submitError = result.error) }
                is AppResult.Success -> _uiState.update { it.copy(isSubmitting = false, submitted = true) }
            }
        }
    }

    private fun edit(transform: (ProposeForm) -> ProposeForm) = _uiState.update { state ->
        val form = transform(state.form)
        state.copy(form = form, errors = if (attempted) ProposeValidation.validate(form, state.today, state.isEditing) else state.errors)
    }
}
