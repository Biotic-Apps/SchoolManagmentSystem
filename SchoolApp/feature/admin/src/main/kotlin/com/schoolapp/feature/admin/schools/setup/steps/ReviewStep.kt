package com.schoolapp.feature.admin.schools.setup.steps

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.KeyValueRow
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.feature.admin.R
import com.schoolapp.feature.admin.schools.setup.SetupUiState
import com.schoolapp.feature.admin.schools.setup.model.SetupStep

/** "Check everything once": one card per step with an Edit link back to it (web ReviewStep). */
@Composable
internal fun ReviewStep(state: SetupUiState, onEdit: (SetupStep) -> Unit, modifier: Modifier = Modifier) {
    val summary = setupSummary(state.form)
    Column(modifier, verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text(summary.sentence, style = MaterialTheme.typography.bodyLarge, color = AppColors.TextPrimary)
        ReviewSection(stringResource(R.string.setup_step_school), summary.school) { onEdit(SetupStep.SCHOOL) }
        ReviewSection(stringResource(R.string.setup_step_branch), summary.branch) { onEdit(SetupStep.BRANCH) }
        ReviewSection(stringResource(R.string.setup_step_people), summary.principal) { onEdit(SetupStep.PEOPLE) }
        ReviewSection(stringResource(R.string.setup_panel_year), summary.academics) { onEdit(SetupStep.PEOPLE) }
        if (state.form.academics.createSession) {
            ReviewSection(stringResource(R.string.setup_step_classes), summary.classes) { onEdit(SetupStep.CLASSES) }
            ReviewSection(stringResource(R.string.setup_step_bell), summary.bell) { onEdit(SetupStep.BELL) }
        }
    }
}

@Composable
private fun ReviewSection(title: String, rows: List<Pair<String, String>>, onEdit: () -> Unit) {
    AppCard(Modifier.fillMaxWidth(), contentPadding = 12.dp) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(title, style = MaterialTheme.typography.titleMedium, color = AppColors.TextPrimary, modifier = Modifier.weight(1f))
            AppTextButton(stringResource(R.string.admin_edit), onEdit)
        }
        rows.forEach { (label, value) -> KeyValueRow(label, value) }
    }
}
