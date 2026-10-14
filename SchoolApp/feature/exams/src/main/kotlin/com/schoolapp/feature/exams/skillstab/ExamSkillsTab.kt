package com.schoolapp.feature.exams.skillstab

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.material.icons.outlined.Tune
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.feature.exams.skillsetup.SkillSetupSheet
import com.schoolapp.feature.exams.skillsetup.SkillSetupState
import com.schoolapp.feature.exams.skillsetup.SkillSetupViewModel
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.ChevronRight
import androidx.compose.material.icons.outlined.Groups
import androidx.compose.material3.Icon
import androidx.compose.runtime.Composable
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.organisation.OrganisationRepository
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.ListItemRow
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.exams.admin.ExamDetail
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.exams.R
import com.schoolapp.feature.exams.SkillsEntryDestination
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@Immutable
data class SkillSection(val id: String, val label: String)

@Immutable
data class ExamSkillsState(
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val error: AppError? = null,
    val sections: List<SkillSection> = emptyList(),
)

/** Sections of the exam's classes; each opens the behaviour & skills ratings of that section. */
@Composable
internal fun ExamSkillsTab(
    exam: ExamDetail,
    onOpen: (Any) -> Unit,
    modifier: Modifier = Modifier,
    viewModel: ExamSkillsViewModel = hiltViewModel(key = "exam_skills_${exam.id}"),
    setup: SkillSetupViewModel = hiltViewModel(key = "skill_setup_${exam.branchId}"),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val setupState by setup.state.collectAsStateWithLifecycle()
    LaunchedEffect(exam.id) {
        viewModel.start(exam, refreshing = false)
        setup.start(exam.branchId)
    }
    RefreshBox(state.isRefreshing, { viewModel.start(exam, refreshing = true) }, modifier) {
        ScreenColumn {
            item(key = "setup") { SkillSetupSummary(setupState, setup::open) }
            item(key = "header") { SectionHeader(title = stringResource(R.string.exams_skills_sections)) }
            when {
                state.isLoading -> item(key = "loading") { LoadingState() }
                state.error != null -> item(key = "error") {
                    ErrorState(state.error?.let { appErrorMessage(it) }.orEmpty(), onRetry = { viewModel.start(exam, refreshing = false) })
                }
                state.sections.isEmpty() -> item(key = "empty") { EmptyState(stringResource(R.string.exams_skills_no_sections), icon = Icons.Outlined.Groups) }
                else -> items(state.sections, key = { it.id }) { section ->
                    AppCard(Modifier.fillMaxWidth(), contentPadding = 0.dp) {
                        ListItemRow(
                            title = section.label,
                            leadingIcon = Icons.Outlined.Groups,
                            onClick = { onOpen(SkillsEntryDestination(exam.id, section.id, "${exam.name} · ${section.label}")) },
                            trailing = { Icon(Icons.Outlined.ChevronRight, contentDescription = null, tint = AppColors.TextSecondary) },
                        )
                    }
                }
            }
        }
    }
    setupState.draft?.let { SkillSetupSheet(it, setup) }
}

@Composable
private fun SkillSetupSummary(state: SkillSetupState, onOpen: () -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        if (state.saved) InlineMessage(stringResource(R.string.exams_skillsetup_saved), StatusTone.Success)
        state.config?.scale?.takeIf { it.isNotEmpty() }?.let { scale ->
            Text(
                stringResource(R.string.exams_skillsetup_legend, scale.joinToString("  ·  ") { "${it.code} = ${it.label}" }),
                style = MaterialTheme.typography.bodyMedium,
                color = AppColors.TextSecondary,
            )
        }
        if (state.canEdit && state.config != null) {
            SecondaryButton(stringResource(R.string.exams_skillsetup_open), onOpen, Modifier.fillMaxWidth(), leadingIcon = Icons.Outlined.Tune)
        }
    }
}

@HiltViewModel
class ExamSkillsViewModel @Inject constructor(private val organisation: OrganisationRepository) : ViewModel() {
    private val _state = MutableStateFlow(ExamSkillsState())
    val state: StateFlow<ExamSkillsState> = _state.asStateFlow()

    private var loadedFor: String? = null

    fun start(exam: ExamDetail, refreshing: Boolean) {
        if (!refreshing && loadedFor == exam.id && _state.value.error == null) return
        loadedFor = exam.id
        val branchId = exam.branchId ?: return _state.update { it.copy(isLoading = false) }
        _state.update { it.copy(isLoading = !refreshing && it.sections.isEmpty(), isRefreshing = refreshing, error = null) }
        viewModelScope.launch {
            val classIds = exam.classIds.toSet()
            when (val result = organisation.sections(branchId, exam.sessionId)) {
                is AppResult.Success -> _state.update {
                    val sections = result.data.filter { section -> section.classId in classIds }
                        .map { SkillSection(it.id, listOfNotNull(it.className, it.name).joinToString("-")) }
                        .sortedBy { it.label }
                    it.copy(isLoading = false, isRefreshing = false, sections = sections)
                }
                is AppResult.Failure -> _state.update { it.copy(isLoading = false, isRefreshing = false, error = result.error) }
            }
        }
    }
}
