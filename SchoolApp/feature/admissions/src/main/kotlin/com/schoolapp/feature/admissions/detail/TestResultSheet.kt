package com.schoolapp.feature.admissions.detail

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.AppTextArea
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.FieldKind
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.admissions.AdmissionTest
import com.schoolapp.core.model.admissions.TestResult
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.admissions.R

/** Entrance test marks: score out of total marks, with remarks. */
@Composable
internal fun TestResultSheet(
    test: AdmissionTest?,
    busy: Boolean,
    error: AppError?,
    onSubmit: (TestResult) -> Unit,
    onDismiss: () -> Unit,
) {
    var score by rememberSaveable { mutableStateOf(test?.score?.trimmed().orEmpty()) }
    var maxScore by rememberSaveable { mutableStateOf(test?.maxScore?.trimmed() ?: DEFAULT_MAX) }
    var remarks by rememberSaveable { mutableStateOf(test?.remarks.orEmpty()) }
    var tried by rememberSaveable { mutableStateOf(false) }
    val problems = ActionForms.scoreProblems(score, maxScore)
    AppBottomSheet(title = stringResource(R.string.admissions_record_result), onDismiss = onDismiss) {
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            AppTextField(
                value = score,
                onValueChange = { score = it.filter { c -> c.isDigit() || c == '.' }.take(NUMBER_MAX) },
                label = stringResource(R.string.admissions_test_score),
                kind = FieldKind.Decimal,
                errorText = if (tried) problems[ActionForms.SCORE]?.let { actionProblemText(it) } else null,
                modifier = Modifier.weight(1f),
            )
            AppTextField(
                value = maxScore,
                onValueChange = { maxScore = it.filter { c -> c.isDigit() || c == '.' }.take(NUMBER_MAX) },
                label = stringResource(R.string.admissions_total_marks),
                kind = FieldKind.Decimal,
                errorText = if (tried) problems[ActionForms.MAX]?.let { actionProblemText(it) } else null,
                modifier = Modifier.weight(1f),
            )
        }
        AppTextArea(remarks, { remarks = it.take(REMARKS_MAX) }, stringResource(R.string.admissions_test_remarks),
            supportingText = stringResource(R.string.admissions_new_optional), minLines = 2)
        error?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
        PrimaryButton(
            text = stringResource(R.string.admissions_save_result),
            onClick = {
                tried = true
                if (problems.isEmpty()) onSubmit(TestResult(score.trim().toDouble(), maxScore.trim().toDouble(), remarks))
            },
            loading = busy,
            modifier = Modifier.fillMaxWidth(),
        )
    }
}

private const val DEFAULT_MAX = "100"
private const val NUMBER_MAX = 8
private const val REMARKS_MAX = 1000
