package com.schoolapp.feature.exams.skills

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.AppTopBar
import com.schoolapp.core.designsystem.component.BackButton
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.feature.exams.R

@Composable
internal fun SkillsEntryRoute(
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: SkillsEntryViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val actions = remember(viewModel) {
        SkillsEntryActions(
            onRetry = viewModel::load,
            onOpenStudent = viewModel::openStudent,
            onRate = viewModel::rate,
            onFillStudent = viewModel::fillStudent,
        )
    }
    val student = state.grid?.students?.firstOrNull { it.studentId == state.openStudentId }
    val closeStudent = { viewModel.openStudent(null) }
    BackHandler(enabled = student != null, onBack = closeStudent)
    AppScaffold(
        modifier = modifier,
        topBar = {
            AppTopBar(
                title = student?.name ?: stringResource(R.string.exams_skills_title),
                subtitle = state.title.ifBlank { null },
                navigationIcon = { BackButton(if (student != null) closeStudent else onBack) },
            )
        },
        bottomBar = {
            if (state.editable && state.edits.isNotEmpty()) {
                Surface(Modifier.fillMaxWidth(), color = AppColors.Surface) {
                    Column {
                        HorizontalDivider(color = AppColors.Border)
                        PrimaryButton(
                            text = pluralStringResource(R.plurals.exams_skills_save, state.edits.size, state.edits.size),
                            onClick = viewModel::save,
                            loading = state.saving,
                            modifier = Modifier.navigationBarsPadding().padding(16.dp).fillMaxWidth(),
                        )
                    }
                }
            }
        },
    ) { padding ->
        SkillsEntryScreen(state, actions, Modifier.padding(padding))
    }
}
