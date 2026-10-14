package com.schoolapp.feature.admin.schools.setup

import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.feature.admin.common.AdminFormMaxWidth
import com.schoolapp.feature.admin.schools.setup.model.SetupStep
import com.schoolapp.feature.admin.schools.setup.steps.BellStep
import com.schoolapp.feature.admin.schools.setup.steps.BranchStep
import com.schoolapp.feature.admin.schools.setup.steps.ClassesStep
import com.schoolapp.feature.admin.schools.setup.steps.PeopleStep
import com.schoolapp.feature.admin.schools.setup.steps.ReviewStep
import com.schoolapp.feature.admin.schools.setup.steps.SchoolStep

/** The current step's helper text and fields; scrolls to the top whenever the step (or its errors) change. */
@Composable
internal fun SetupStepContent(state: SetupUiState, edits: SetupFormEdits, onEditStep: (SetupStep) -> Unit, modifier: Modifier = Modifier) {
    val listState = rememberLazyListState()
    LaunchedEffect(state.step, state.errors.keys.size) { listState.scrollToItem(0) }
    ScreenColumn(modifier, maxWidth = AdminFormMaxWidth, state = listState) {
        item(key = "helper_${state.step}") {
            Text(stringResource(state.step.helper), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
        }
        item(key = "step_${state.step}") {
            when (state.step) {
                SetupStep.SCHOOL -> SchoolStep(state, edits)
                SetupStep.BRANCH -> BranchStep(state, edits)
                SetupStep.PEOPLE -> PeopleStep(state, edits)
                SetupStep.CLASSES -> ClassesStep(state, edits)
                SetupStep.BELL -> BellStep(state, edits)
                SetupStep.REVIEW -> ReviewStep(state, onEdit = onEditStep)
            }
        }
    }
}
