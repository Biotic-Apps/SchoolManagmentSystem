package com.schoolapp.feature.diary

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.RoleRef
import com.schoolapp.feature.diary.parent.ParentDiaryRoute
import com.schoolapp.feature.diary.supervisor.SupervisorDiaryRoute
import com.schoolapp.feature.diary.teacher.TeacherDiaryRoute

/** Menu `diary`: teachers/helpers write, parents read the active child's feed, supervisors track missing diaries. */
@Composable
fun DiaryMenuScreen(
    role: RoleRef,
    onOpen: (Any) -> Unit,
    onOpenApprovals: (() -> Unit)?,
    modifier: Modifier = Modifier,
) {
    when (role) {
        RoleKey.TEACHER, RoleKey.HELPER -> TeacherDiaryRoute(onOpen = onOpen, modifier = modifier)
        RoleKey.PARENT -> ParentDiaryRoute(modifier = modifier)
        else -> SupervisorDiaryRoute(onOpenApprovals = onOpenApprovals, modifier = modifier)
    }
}
