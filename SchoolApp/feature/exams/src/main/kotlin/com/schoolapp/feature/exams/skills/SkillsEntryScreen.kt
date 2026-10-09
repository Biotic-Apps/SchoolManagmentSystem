package com.schoolapp.feature.exams.skills

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.lazy.LazyListScope
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Groups
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.FilterChipRow
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.model.exams.SkillDomain
import com.schoolapp.core.model.exams.SkillGrid
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.exams.R
import com.schoolapp.feature.exams.skills.components.SkillItemRow
import com.schoolapp.feature.exams.skills.components.SkillStudentRow

internal class SkillsEntryActions(
    val onRetry: () -> Unit,
    val onOpenStudent: (String?) -> Unit,
    val onRate: (String, String, Int) -> Unit,
    val onFillStudent: (String, Int) -> Unit,
)

/** Student list with rating progress, or one student's items with level chips. */
@Composable
internal fun SkillsEntryScreen(state: SkillsEntryUiState, actions: SkillsEntryActions, modifier: Modifier = Modifier) {
    val grid = state.grid
    val openId = state.openStudentId
    when {
        state.isLoading -> LoadingState(modifier)
        grid == null -> ErrorState(
            state.error?.let { appErrorMessage(it) } ?: stringResource(R.string.exams_skills_unavailable),
            modifier,
            onRetry = actions.onRetry,
        )
        grid.students.isEmpty() -> EmptyState(stringResource(R.string.exams_roster_empty), modifier, icon = Icons.Outlined.Groups)
        openId != null -> StudentSkills(state, grid, openId, actions, modifier)
        else -> StudentList(state, grid, actions, modifier)
    }
}

@Composable
private fun StudentList(state: SkillsEntryUiState, grid: SkillGrid, actions: SkillsEntryActions, modifier: Modifier) {
    ScreenColumn(modifier) {
        banners(state)
        item(key = "summary") {
            SectionHeader(
                title = stringResource(R.string.exams_skills_complete, grid.complete, grid.students.size),
                subtitle = grid.scale.joinToString("   ") { "${it.code} ${it.label}" },
            )
        }
        items(grid.students, key = { it.studentId }) { student ->
            SkillStudentRow(
                student = student,
                rated = state.ratedCount(student.studentId),
                total = grid.items.size,
                onClick = { actions.onOpenStudent(student.studentId) },
            )
        }
    }
}

@Composable
private fun StudentSkills(
    state: SkillsEntryUiState,
    grid: SkillGrid,
    studentId: String,
    actions: SkillsEntryActions,
    modifier: Modifier,
) {
    val index = grid.students.indexOfFirst { it.studentId == studentId }
    ScreenColumn(modifier) {
        banners(state)
        if (state.editable) {
            item(key = "fill") {
                SectionHeader(title = stringResource(R.string.exams_skills_fill_empty))
                FilterChipRow(
                    options = grid.scale.map { SwitcherOption(it.value.toString(), "${it.code} · ${it.label}") },
                    selectedId = null,
                    onSelect = { actions.onFillStudent(studentId, it.toInt()) },
                )
            }
        }
        SkillDomain.entries.forEach { domain ->
            val domainItems = grid.items.filter { it.domain == domain }
            if (domainItems.isEmpty()) return@forEach
            item(key = "domain_${domain.name}") {
                AppCard(Modifier.fillMaxWidth()) {
                    SectionHeader(
                        title = stringResource(
                            if (domain == SkillDomain.AFFECTIVE) R.string.exams_skills_affective else R.string.exams_skills_psychomotor,
                        ),
                    )
                    domainItems.forEach { item ->
                        SkillItemRow(
                            item = item,
                            scale = grid.scale,
                            value = state.valueOf(studentId, item.id),
                            enabled = state.editable && !state.saving,
                            onSelect = { actions.onRate(studentId, item.id, it) },
                        )
                    }
                }
            }
        }
        item(key = "nav") {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                SecondaryButton(
                    text = stringResource(R.string.exams_skills_previous),
                    onClick = { actions.onOpenStudent(grid.students.getOrNull(index - 1)?.studentId) },
                    enabled = index > 0,
                    modifier = Modifier.weight(1f),
                )
                SecondaryButton(
                    text = stringResource(
                        if (index < grid.students.size - 1) R.string.exams_skills_next else R.string.exams_skills_done,
                    ),
                    onClick = { actions.onOpenStudent(grid.students.getOrNull(index + 1)?.studentId) },
                    modifier = Modifier.weight(1f),
                )
            }
        }
    }
}

private fun LazyListScope.banners(state: SkillsEntryUiState) {
    val grid = state.grid ?: return
    if (!grid.editable) item(key = "locked") { InlineMessage(stringResource(R.string.exams_skills_locked), StatusTone.Info) }
    state.saveError?.let { error -> item(key = "error") { InlineMessage(appErrorMessage(error), StatusTone.Error) } }
    if (state.saved) item(key = "saved") { InlineMessage(stringResource(R.string.exams_skills_saved), StatusTone.Success) }
}
