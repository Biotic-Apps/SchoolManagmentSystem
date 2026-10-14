package com.schoolapp.feature.payroll.runs.overview

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.feature.payroll.R
import com.schoolapp.feature.payroll.runs.RunNotice

/** Banner after a successful action (or the "already exists" info after a 409). */
@Composable
internal fun RunNoticeBanner(notice: RunNotice, modifier: Modifier = Modifier) {
    val text = stringResource(
        when (notice) {
            RunNotice.CREATED -> R.string.payroll_notice_created
            RunNotice.ALREADY_EXISTS -> R.string.payroll_notice_exists
            RunNotice.CALCULATED -> R.string.payroll_notice_calculated
            RunNotice.REVIEWED -> R.string.payroll_notice_reviewed
            RunNotice.SENT -> R.string.payroll_notice_sent
            RunNotice.CLOSED -> R.string.payroll_notice_closed
            RunNotice.PAID -> R.string.payroll_notice_paid
        },
    )
    InlineMessage(text, if (notice == RunNotice.ALREADY_EXISTS) StatusTone.Info else StatusTone.Success, modifier)
}
