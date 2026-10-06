package com.schoolapp.core.model.dashboard

import com.schoolapp.core.model.attendance.RegisterStatus
import com.schoolapp.core.model.timetable.TeacherSlot

data class TeacherToday(
    val periods: List<TeacherSlot>,
    val registers: List<SectionRegisterState>,
    val diariesPending: List<PendingDiarySlot>,
    val unreadMessages: Int,
    val assignedComplaints: Int,
)

data class SectionRegisterState(val sectionId: String, val sectionLabel: String?, val status: RegisterStatus)

data class PendingDiarySlot(val sectionId: String, val sectionLabel: String?, val subjectId: String?, val subjectName: String?)
