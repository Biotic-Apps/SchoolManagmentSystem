package com.schoolapp.feature.attendance

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.RoleRef
import com.schoolapp.feature.attendance.child.ChildAttendanceRoute
import com.schoolapp.feature.attendance.mark.MarkHomeRoute
import com.schoolapp.feature.attendance.staff.MyAttendanceLeaveRoute
import com.schoolapp.feature.attendance.supervisor.SupervisorAttendanceRoute

/**
 * Menu `attendance`: teachers and helpers mark their sections, parents see the active child,
 * supervisors (and custom roles) get the branch's day, plus a Staff tab when they may mark staff attendance.
 */
@Composable
fun AttendanceMenuScreen(role: RoleRef, onOpen: (Any) -> Unit, modifier: Modifier = Modifier) {
    val key = "attendance_${role.key}"
    when (role) {
        RoleKey.TEACHER, RoleKey.HELPER -> MarkHomeRoute(onOpen, modifier, hiltViewModel(key = key))
        RoleKey.PARENT -> ChildAttendanceRoute(modifier, hiltViewModel(key = key))
        else -> SupervisorAttendanceRoute(role.key, onOpen, modifier)
    }
}

/** Menu `my_salary` (staff): own attendance and leave; salary slips arrive in a later phase. */
@Composable
@Suppress("UnusedParameter")
fun MyAttendanceLeaveScreen(onOpen: (Any) -> Unit, modifier: Modifier = Modifier) {
    MyAttendanceLeaveRoute(modifier)
}
