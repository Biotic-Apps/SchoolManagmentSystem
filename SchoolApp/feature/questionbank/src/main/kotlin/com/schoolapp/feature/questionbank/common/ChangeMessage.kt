package com.schoolapp.feature.questionbank.common

import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import com.schoolapp.feature.questionbank.R

@Composable
internal fun changeMessage(change: QuestionBankChange): String = stringResource(
    when (change) {
        QuestionBankChange.QUESTION_ADDED -> R.string.qb_question_added
        QuestionBankChange.QUESTION_UPDATED -> R.string.qb_question_updated
        QuestionBankChange.QUESTION_ARCHIVED -> R.string.qb_question_deleted
        QuestionBankChange.PAPER_GENERATED -> R.string.qb_paper_generated
        QuestionBankChange.PAPER_UPDATED -> R.string.qb_paper_updated
    },
)
