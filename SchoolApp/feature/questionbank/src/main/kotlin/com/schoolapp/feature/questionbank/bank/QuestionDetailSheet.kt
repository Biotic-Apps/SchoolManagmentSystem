package com.schoolapp.feature.questionbank.bank

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Delete
import androidx.compose.material.icons.outlined.Edit
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.KeyValueRow
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.questions.Question
import com.schoolapp.core.ui.actionErrorMessage
import com.schoolapp.feature.questionbank.R
import com.schoolapp.feature.questionbank.common.QuestionPermissions
import com.schoolapp.feature.questionbank.common.difficultyLabel
import com.schoolapp.feature.questionbank.common.optionLetter
import com.schoolapp.feature.questionbank.common.typeLabel

/** Full question with its choices and answer; edit / delete when the role may. */
@Composable
internal fun QuestionDetailSheet(
    question: Question,
    permissions: QuestionPermissions,
    archiving: Boolean,
    actionError: AppError?,
    onEdit: () -> Unit,
    onDelete: () -> Unit,
    onDismiss: () -> Unit,
) {
    AppBottomSheet(title = stringResource(R.string.qb_question_detail), onDismiss = onDismiss) {
        Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Text(question.text, style = MaterialTheme.typography.bodyLarge, color = AppColors.TextPrimary)
            if (question.options.isNotEmpty()) {
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    question.options.forEachIndexed { index, option ->
                        Text(
                            text = "${optionLetter(index)} $option",
                            style = MaterialTheme.typography.bodyMedium,
                            color = AppColors.TextPrimary,
                        )
                    }
                }
            }
            Column {
                KeyValueRow(stringResource(R.string.qb_correct_answer), question.correctAnswer)
                KeyValueRow(stringResource(R.string.qb_field_subject), question.subjectName ?: "-")
                KeyValueRow(stringResource(R.string.qb_field_class), question.className ?: "-")
                KeyValueRow(stringResource(R.string.qb_field_chapter), question.chapterName)
                KeyValueRow(stringResource(R.string.qb_field_type), typeLabel(question.type))
                KeyValueRow(stringResource(R.string.qb_field_difficulty), difficultyLabel(question.difficulty))
                KeyValueRow(stringResource(R.string.qb_field_marks), question.marks.toString())
            }
            actionError?.let { InlineMessage(actionErrorMessage(it), StatusTone.Error) }
            if (permissions.canEdit || permissions.canDelete) {
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    if (permissions.canDelete) {
                        SecondaryButton(
                            text = stringResource(R.string.qb_delete),
                            onClick = onDelete,
                            loading = archiving,
                            leadingIcon = Icons.Outlined.Delete,
                            contentColor = AppColors.Error,
                            modifier = Modifier.weight(1f),
                        )
                    }
                    if (permissions.canEdit) {
                        PrimaryButton(
                            text = stringResource(R.string.qb_edit),
                            onClick = onEdit,
                            enabled = !archiving,
                            leadingIcon = Icons.Outlined.Edit,
                            modifier = Modifier.weight(1f),
                        )
                    }
                }
            }
        }
    }
}
