package com.schoolapp.feature.organisation.setup

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.academics.AcademicsEvents
import com.schoolapp.core.data.academics.CatalogueRepository
import com.schoolapp.core.data.academics.ClassStructureRepository
import com.schoolapp.core.data.academics.TeacherAllocationRepository
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.common.toActionError
import com.schoolapp.core.data.timetable.BellScheduleRepository
import com.schoolapp.core.model.SessionContext
import com.schoolapp.core.model.academics.ClassSetup
import com.schoolapp.core.model.timetable.BellSchedule
import com.schoolapp.core.navigation.ClassSetupDestination
import com.schoolapp.core.ui.SaveTracker
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.async
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/**
 * Class setup: one scrollable screen with Sections, Subjects and Teachers, every change autosaved through
 * the web's endpoints. Card logic lives in [SectionsController], [CurriculumController] and [AllocationController].
 */
@HiltViewModel
class ClassSetupViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val structure: ClassStructureRepository,
    allocation: TeacherAllocationRepository,
    private val catalogue: CatalogueRepository,
    private val bell: BellScheduleRepository,
    private val authRepository: AuthRepository,
    private val events: AcademicsEvents,
) : ViewModel() {

    private val route = ClassSetupDestination(
        classId = checkNotNull(savedStateHandle["classId"]) { "Class id missing" },
        branchId = checkNotNull(savedStateHandle["branchId"]) { "Branch id missing" },
        sessionId = savedStateHandle["sessionId"],
        schoolId = savedStateHandle["schoolId"],
    )
    private val _uiState = MutableStateFlow(ClassSetupUiState())
    val uiState: StateFlow<ClassSetupUiState> = _uiState.asStateFlow()

    private val tracker = SaveTracker()
    private val ctx = SetupContext(
        classId = route.classId,
        branchId = route.branchId,
        sessionId = route.sessionId,
        schoolId = route.schoolId,
        state = _uiState,
        scope = viewModelScope,
        tracker = tracker,
        afterSave = {
            events.changed()
            reload()
        },
    )
    internal val sections = SectionsController(ctx, structure, allocation, catalogue)
    internal val curriculum = CurriculumController(ctx, structure, catalogue)
    internal val teachers = AllocationController(ctx, allocation)
    private val allocationRepository = allocation

    init {
        viewModelScope.launch { tracker.status.collect { status -> _uiState.update { it.copy(saveStatus = status) } } }
        load()
    }

    fun load() {
        _uiState.update { it.copy(isLoading = true, loadError = null) }
        viewModelScope.launch {
            val session = authRepository.session.filterNotNull().first()
            val extras = async { loadExtras() }
            when (val result = structure.classSetup(route.classId, route.branchId, route.sessionId)) {
                is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, loadError = result.error) }
                is AppResult.Success -> {
                    curriculum.sync(result.data.subjects)
                    _uiState.update { it.copy(isLoading = false, setup = result.data, rights = rightsFor(result.data, session)) }
                }
            }
            extras.await()
        }
    }

    /** After a save: fresh counts, allocation and teacher load without a spinner; unsaved subject edits stay. */
    private suspend fun reload() {
        val fresh = (structure.classSetup(route.classId, route.branchId, route.sessionId) as? AppResult.Success)?.data ?: return
        curriculum.sync(fresh.subjects)
        _uiState.update { state ->
            val subjects = if (curriculum.hasPending) state.subjects else fresh.subjects
            state.copy(setup = fresh.copy(subjects = subjects))
        }
        val sessionId = fresh.sessionId ?: route.sessionId
        (allocationRepository.teachingStaff(route.branchId, sessionId) as? AppResult.Success)?.let { staff ->
            _uiState.update { it.copy(staff = staff.data) }
        }
    }

    private suspend fun loadExtras() {
        val staff = allocationRepository.teachingStaff(route.branchId, route.sessionId)
        val rooms = catalogue.rooms(route.branchId)
        val subjects = catalogue.subjects(route.schoolId)
        val schedule = bell.schedule(route.branchId)
        _uiState.update {
            it.copy(
                staff = (staff as? AppResult.Success)?.data.orEmpty(),
                rooms = (rooms as? AppResult.Success)?.data.orEmpty(),
                schoolSubjects = (subjects as? AppResult.Success)?.data.orEmpty(),
                weeklyPeriods = (schedule as? AppResult.Success)?.data?.let(::teachingPeriodsPerWeek),
            )
        }
    }

    // --- Header ----------------------------------------------------------------------------------

    fun startRename() = _uiState.update { it.copy(nameDraft = it.setup?.className.orEmpty()) }

    fun onNameDraftChange(name: String) = _uiState.update { it.copy(nameDraft = name.take(MAX_CLASS_NAME)) }

    fun cancelRename() = _uiState.update { it.copy(nameDraft = null) }

    fun saveRename() {
        val name = _uiState.value.nameDraft?.trim().orEmpty()
        if (name.isEmpty() || name == _uiState.value.setup?.className) {
            cancelRename()
            return
        }
        _uiState.update { it.copy(nameDraft = null) }
        ctx.updateSetup { it.copy(className = name) }
        viewModelScope.launch { ctx.save { structure.renameClass(route.classId, name) } }
    }

    fun revealGroups() = _uiState.update { it.copy(groupsRevealed = true) }

    fun dismissBanner() = _uiState.update { it.copy(banner = null) }

    fun dismissSubjectError(subjectId: String) = _uiState.update { it.copy(subjectErrors = it.subjectErrors - subjectId) }

    private fun rightsFor(setup: ClassSetup, session: SessionContext) = SetupRights(
        editStructure = setup.canEditStructure,
        addSection = setup.canEditStructure && session.has(CLASSES_ADD) && (setup.sessionId ?: route.sessionId) != null,
        removeSection = setup.canEditStructure && session.has(CLASSES_DELETE),
        createSubject = setup.canEditStructure && session.has(CLASSES_ADD) && route.schoolId != null,
        createRoom = setup.canEditStructure && (session.has(CLASSES_ADD) || session.has(TIMETABLE_EDIT)),
        allocate = setup.canAllocate,
    )

    internal companion object {
        const val CLASSES_ADD = "classes.add"
        const val CLASSES_DELETE = "classes.delete"
        const val TIMETABLE_EDIT = "timetable.edit"
        const val MAX_CLASS_NAME = 40

        /** Each working day uses its own schedule when it has one (Friday). */
        fun teachingPeriodsPerWeek(schedule: BellSchedule): Int? {
            if (schedule.default.isEmpty()) return null
            val days = schedule.workingDays.ifEmpty { (1..5).toList() }
            return days.sumOf { day -> schedule.periodsFor(day).count { !it.isBreak } }
        }
    }
}

