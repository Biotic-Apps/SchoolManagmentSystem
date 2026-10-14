package com.schoolapp.feature.homework

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.RoleRef
import com.schoolapp.feature.homework.parent.ParentHomeworkRoute
import com.schoolapp.feature.homework.staff.StaffHomeworkRoute

/**
 * Menu `homework` (Homework Submissions). Parents see the active child's homework and submit;
 * every other role manages homework per section (assign, review, grade, return) as on the web.
 */
@Composable
fun HomeworkMenuScreen(role: RoleRef, onOpen: (Any) -> Unit, modifier: Modifier = Modifier) {
    when (role) {
        RoleKey.PARENT -> ParentHomeworkRoute(onOpen = onOpen, modifier = modifier)
        else -> StaffHomeworkRoute(onOpen = onOpen, modifier = modifier)
    }
}
