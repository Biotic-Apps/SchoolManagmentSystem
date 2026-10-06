package com.schoolapp.feature.syllabus.coverage

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.MenuBook
import androidx.compose.material.icons.outlined.TaskAlt
import androidx.compose.material3.HorizontalDivider
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.ProgressRow
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.syllabus.R
import com.schoolapp.feature.syllabus.components.progressSummary
import com.schoolapp.feature.syllabus.components.tone

/** [onReviewSubmitted] opens Approvals, where submitted plans and book lists are approved or returned. */
@Composable
fun CoverageRoute(
    onReviewSubmitted: (() -> Unit)?,
    modifier: Modifier = Modifier,
    viewModel: CoverageViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    CoverageScreen(state, onReviewSubmitted, viewModel::load, modifier)
}

@Composable
fun CoverageScreen(
    state: CoverageUiState,
    onReviewSubmitted: (() -> Unit)?,
    onRetry: () -> Unit,
    modifier: Modifier = Modifier,
) {
    when {
        state.isLoading -> LoadingState(modifier)
        state.error != null -> ErrorState(appErrorMessage(state.error), modifier, onRetry = onRetry)
        else -> ScreenColumn(modifier) {
            onReviewSubmitted?.let { review ->
                item(key = "review") {
                    SecondaryButton(
                        text = stringResource(R.string.syllabus_review_submitted),
                        onClick = review,
                        leadingIcon = Icons.Outlined.TaskAlt,
                        modifier = Modifier.fillMaxWidth(),
                    )
                }
            }
            item(key = "coverage") {
                if (state.rows.isEmpty()) {
                    EmptyState(stringResource(R.string.syllabus_coverage_empty), icon = Icons.AutoMirrored.Outlined.MenuBook)
                } else {
                    AppCard(Modifier.fillMaxWidth(), contentPadding = 0.dp) {
                        SectionHeader(stringResource(R.string.syllabus_coverage), Modifier.padding(horizontal = 16.dp, vertical = 4.dp))
                        state.rows.forEach { row ->
                            HorizontalDivider(color = AppColors.Border)
                            ProgressRow(
                                title = listOfNotNull(
                                    listOfNotNull(row.className, row.sectionName).joinToString(" - ").ifBlank { null },
                                    row.subjectName,
                                ).joinToString(" · "),
                                percent = row.progress.percent,
                                supporting = progressSummary(row.progress),
                                tone = row.progress.tone(),
                            )
                        }
                    }
                }
            }
        }
    }
}
