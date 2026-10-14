package com.schoolapp.feature.questionbank.common

import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.PickerOption
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.questions.Difficulty
import com.schoolapp.core.model.questions.PaperStatus
import com.schoolapp.core.model.questions.QuestionType
import com.schoolapp.feature.questionbank.R

@Composable
internal fun typeLabel(type: QuestionType?): String = stringResource(
    when (type) {
        QuestionType.MCQ -> R.string.qb_type_mcq
        QuestionType.SHORT -> R.string.qb_type_short
        QuestionType.LONG -> R.string.qb_type_long
        QuestionType.TRUE_FALSE -> R.string.qb_type_true_false
        QuestionType.FILL_BLANK -> R.string.qb_type_fill_blank
        null -> R.string.qb_type_unknown
    },
)

@Composable
internal fun difficultyLabel(difficulty: Difficulty?): String = stringResource(
    when (difficulty) {
        Difficulty.EASY -> R.string.qb_difficulty_easy
        Difficulty.MEDIUM -> R.string.qb_difficulty_medium
        Difficulty.HARD -> R.string.qb_difficulty_hard
        null -> R.string.qb_type_unknown
    },
)

internal fun difficultyTone(difficulty: Difficulty?): StatusTone = when (difficulty) {
    Difficulty.EASY -> StatusTone.Success
    Difficulty.MEDIUM -> StatusTone.Warning
    Difficulty.HARD -> StatusTone.Error
    null -> StatusTone.Neutral
}

@Composable
internal fun paperStatusLabel(status: PaperStatus): String = stringResource(
    if (status == PaperStatus.PUBLISHED) R.string.qb_status_published else R.string.qb_status_draft,
)

internal fun paperStatusTone(status: PaperStatus): StatusTone =
    if (status == PaperStatus.PUBLISHED) StatusTone.Success else StatusTone.Info

@Composable
internal fun typeOptions(): List<PickerOption> = QuestionType.entries.map { PickerOption(it.key, typeLabel(it)) }

@Composable
internal fun difficultyOptions(): List<PickerOption> = Difficulty.entries.map { PickerOption(it.key, difficultyLabel(it)) }

/** "a) Paris" style prefix for MCQ choices. */
internal fun optionLetter(index: Int): String = "${'a' + index})"
