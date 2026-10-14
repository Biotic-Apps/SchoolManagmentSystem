package com.schoolapp.feature.fees.staff.structure.form

import androidx.compose.runtime.Immutable
import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.navigation.toRoute
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.fees.structure.FeeStructureRepository
import com.schoolapp.core.data.organisation.OrganisationRepository
import com.schoolapp.core.model.fees.structure.FeeHead
import com.schoolapp.core.model.fees.structure.FeePlanInput
import com.schoolapp.core.model.fees.structure.FeePlanStatus
import com.schoolapp.core.model.organisation.SchoolClass
import com.schoolapp.feature.fees.staff.structure.FeePlanFormDestination
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.async
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@Immutable
data class FeePlanFormUiState(
    val isLoading: Boolean = true,
    val error: AppError? = null,
    val isEdit: Boolean = false,
    val wasApproved: Boolean = false,
    val classes: List<SchoolClass> = emptyList(),
    val heads: List<FeeHead> = emptyList(),
    val form: FeePlanForm = FeePlanForm(),
    val isSaving: Boolean = false,
    val saveError: AppError? = null,
    val saved: Boolean = false,
)

/** New or edited fee plan of one class in one session. */
@HiltViewModel
class FeePlanFormViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val repository: FeeStructureRepository,
    private val organisation: OrganisationRepository,
) : ViewModel() {

    private val args = savedStateHandle.toRoute<FeePlanFormDestination>()
    private val _uiState = MutableStateFlow(FeePlanFormUiState(isEdit = args.planId != null))
    val uiState: StateFlow<FeePlanFormUiState> = _uiState.asStateFlow()

    init {
        load()
    }

    fun retry() = load()

    fun edit(change: (FeePlanForm) -> FeePlanForm) = _uiState.update { state ->
        val form = change(state.form)
        state.copy(form = if (form.showIssues) form.copy(issues = form.validate()) else form)
    }

    fun save() {
        val state = _uiState.value
        if (state.isSaving) return
        val issues = state.form.validate()
        if (!issues.isEmpty) {
            _uiState.update { it.copy(form = it.form.copy(issues = issues, showIssues = true)) }
            return
        }
        val form = state.form
        val input = FeePlanInput(args.branchId, args.sessionId, checkNotNull(form.classId), form.name, form.planItems(), form.late())
        _uiState.update { it.copy(isSaving = true, saveError = null) }
        viewModelScope.launch {
            when (val result = repository.saveFeePlan(args.planId, input)) {
                is AppResult.Success -> _uiState.update { it.copy(isSaving = false, saved = true) }
                is AppResult.Failure -> _uiState.update { it.copy(isSaving = false, saveError = result.error) }
            }
        }
    }

    private fun load() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            val classes = async { organisation.classes(args.schoolId) }
            val heads = async { repository.feeHeads(args.schoolId) }
            val plan = args.planId?.let { id -> async { repository.feePlans(args.branchId, args.sessionId) to id } }
            val classesResult = classes.await()
            val headsResult = heads.await()
            val planResult = plan?.await()
            val failure = listOfNotNull(classesResult, headsResult, planResult?.first).filterIsInstance<AppResult.Failure>().firstOrNull()
            if (failure != null) {
                _uiState.update { it.copy(isLoading = false, error = failure.error) }
                return@launch
            }
            val existing = (planResult?.first as? AppResult.Success)?.data?.firstOrNull { it.id == planResult.second }
            _uiState.update { state ->
                state.copy(
                    isLoading = false,
                    classes = (classesResult as AppResult.Success).data.sortedBy { it.levelOrder ?: Int.MAX_VALUE },
                    heads = (headsResult as AppResult.Success).data.filterNot { it.system }.sortedBy { it.name },
                    form = existing?.let(FeePlanForm::from) ?: state.form,
                    wasApproved = existing?.status == FeePlanStatus.APPROVED,
                )
            }
        }
    }
}
