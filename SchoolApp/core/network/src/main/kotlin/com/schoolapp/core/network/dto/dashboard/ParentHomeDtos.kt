package com.schoolapp.core.network.dto.dashboard

import com.schoolapp.core.network.dto.diary.DiaryEntryDto
import com.schoolapp.core.network.dto.fees.FeeSummaryDto
import com.schoolapp.core.network.dto.meeting.MeetingDto
import com.schoolapp.core.network.dto.notice.NoticeDto
import com.schoolapp.core.network.dto.timetable.TeacherSlotDto
import kotlinx.serialization.Serializable

/** `GET /parent/home?studentId=`; [fees] has the `/students/:id/fee-summary` shape. */
@Serializable
data class ParentHomeDto(
    val child: ParentChildDto,
    val attendance: ParentAttendanceDto? = null,
    val fees: FeeSummaryDto? = null,
    val latestResult: LatestResultDto? = null,
    val homework: HomeworkDueDto? = null,
    val todayPeriods: List<TeacherSlotDto> = emptyList(),
    val diary: List<DiaryEntryDto> = emptyList(),
    val notices: List<NoticeDto> = emptyList(),
    val meetings: List<MeetingDto> = emptyList(),
    val events: List<ParentEventDto> = emptyList(),
    val consentsPending: Int = 0,
)

@Serializable
data class ParentChildDto(
    val id: String,
    val name: String,
    val photoUrl: String? = null,
    val admissionNo: String? = null,
    val className: String? = null,
    val sectionName: String? = null,
    val rollNo: Int? = null,
    val branchName: String? = null,
    val branchPhone: String? = null,
    val classTeacher: ClassTeacherDto? = null,
)

@Serializable
data class ClassTeacherDto(val name: String, val userId: String? = null)
