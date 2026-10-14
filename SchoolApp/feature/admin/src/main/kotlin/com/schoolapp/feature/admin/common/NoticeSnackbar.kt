package com.schoolapp.feature.admin.common

import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.ReadOnlyComposable
import androidx.compose.ui.res.stringResource
import com.schoolapp.feature.admin.R

/** Shows [notice] once in [snackbar], then calls [consume]. */
@Composable
internal fun NoticeSnackbarEffect(notice: AdminNotice?, snackbar: SnackbarHostState, consume: (AdminNotice) -> Unit) {
    val text = notice?.let { noticeText(it) }
    LaunchedEffect(notice) {
        if (notice != null && text != null) {
            consume(notice)
            snackbar.showSnackbar(text)
        }
    }
}

@Composable
@ReadOnlyComposable
private fun noticeText(notice: AdminNotice): String = when (notice.kind) {
    AdminNotice.Kind.SCHOOL_UPDATED -> stringResource(R.string.admin_notice_school_updated)
    AdminNotice.Kind.SCHOOL_ARCHIVED -> stringResource(R.string.admin_notice_school_archived)
    AdminNotice.Kind.SCHOOL_RESTORED -> stringResource(R.string.admin_notice_school_restored)
    AdminNotice.Kind.SCHOOL_DELETED -> stringResource(R.string.admin_notice_school_deleted, notice.name)
    AdminNotice.Kind.SCHOOL_CREATED -> stringResource(R.string.admin_notice_school_created, notice.name)
    AdminNotice.Kind.USER_CREATED -> stringResource(R.string.admin_notice_user_created)
    AdminNotice.Kind.USER_UPDATED -> stringResource(R.string.admin_notice_user_updated)
    AdminNotice.Kind.USER_DISABLED -> stringResource(R.string.admin_notice_user_disabled)
    AdminNotice.Kind.USER_ENABLED -> stringResource(R.string.admin_notice_user_enabled)
    AdminNotice.Kind.USER_UNLOCKED -> stringResource(R.string.admin_notice_user_unlocked)
    AdminNotice.Kind.ROLE_ASSIGNED -> stringResource(R.string.admin_notice_role_assigned)
    AdminNotice.Kind.ASSIGNMENT_ENDED -> stringResource(R.string.admin_notice_assignment_ended)
}
