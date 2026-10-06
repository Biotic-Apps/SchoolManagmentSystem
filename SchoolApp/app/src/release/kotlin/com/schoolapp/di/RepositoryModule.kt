package com.schoolapp.di

import com.schoolapp.core.data.approvals.ApprovalsRepository
import com.schoolapp.core.data.approvals.DefaultApprovalsRepository
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.auth.DefaultAuthRepository
import com.schoolapp.core.data.dashboard.DashboardRepository
import com.schoolapp.core.data.dashboard.DefaultDashboardRepository
import com.schoolapp.core.data.notifications.DefaultNotificationsRepository
import com.schoolapp.core.data.notifications.NotificationsRepository
import com.schoolapp.core.data.organisation.DefaultOrganisationRepository
import com.schoolapp.core.data.organisation.OrganisationRepository
import com.schoolapp.core.data.profile.DefaultProfileRepository
import com.schoolapp.core.data.profile.ProfileRepository
import com.schoolapp.core.data.people.StudentsRepository
import com.schoolapp.core.data.people.DefaultStudentsRepository
import com.schoolapp.core.data.people.GuardiansRepository
import com.schoolapp.core.data.people.DefaultGuardiansRepository
import com.schoolapp.core.data.staff.StaffRepository
import com.schoolapp.core.data.staff.DefaultStaffRepository
import com.schoolapp.core.data.timetable.TimetableRepository
import com.schoolapp.core.data.timetable.DefaultTimetableRepository
import com.schoolapp.core.data.syllabus.SyllabusRepository
import com.schoolapp.core.data.syllabus.DefaultSyllabusRepository
import com.schoolapp.core.data.admissions.AdmissionsRepository
import com.schoolapp.core.data.admissions.DefaultAdmissionsRepository
import com.schoolapp.core.data.attendance.AttendanceRepository
import com.schoolapp.core.data.attendance.DefaultAttendanceRepository
import com.schoolapp.core.data.leave.LeaveRepository
import com.schoolapp.core.data.leave.DefaultLeaveRepository
import com.schoolapp.core.data.diary.DiaryRepository
import com.schoolapp.core.data.diary.DefaultDiaryRepository
import com.schoolapp.core.data.files.FilesRepository
import com.schoolapp.core.data.files.DefaultFilesRepository
import com.schoolapp.core.data.activities.ActivitiesRepository
import com.schoolapp.core.data.activities.DefaultActivitiesRepository
import com.schoolapp.core.data.notices.NoticesRepository
import com.schoolapp.core.data.notices.DefaultNoticesRepository
import com.schoolapp.core.data.messages.MessagesRepository
import com.schoolapp.core.data.messages.DefaultMessagesRepository
import com.schoolapp.core.data.complaints.ComplaintsRepository
import com.schoolapp.core.data.complaints.DefaultComplaintsRepository
import com.schoolapp.core.data.meetings.MeetingsRepository
import com.schoolapp.core.data.meetings.DefaultMeetingsRepository
import com.schoolapp.core.data.health.HealthRepository
import com.schoolapp.core.data.health.DefaultHealthRepository
import com.schoolapp.core.data.pickup.PickupRepository
import com.schoolapp.core.data.pickup.DefaultPickupRepository
import com.schoolapp.core.data.notifications.NotificationPreferencesRepository
import com.schoolapp.core.data.notifications.DefaultNotificationPreferencesRepository
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent

@Module
@InstallIn(SingletonComponent::class)
interface RepositoryModule {
    @Binds
    fun bindAuthRepository(impl: DefaultAuthRepository): AuthRepository

    @Binds
    fun bindProfileRepository(impl: DefaultProfileRepository): ProfileRepository

    @Binds
    fun bindDashboardRepository(impl: DefaultDashboardRepository): DashboardRepository

    @Binds
    fun bindApprovalsRepository(impl: DefaultApprovalsRepository): ApprovalsRepository

    @Binds
    fun bindNotificationsRepository(impl: DefaultNotificationsRepository): NotificationsRepository

    @Binds
    fun bindOrganisationRepository(impl: DefaultOrganisationRepository): OrganisationRepository

    @Binds
    fun bindStudentsRepository(impl: DefaultStudentsRepository): StudentsRepository

    @Binds
    fun bindGuardiansRepository(impl: DefaultGuardiansRepository): GuardiansRepository

    @Binds
    fun bindStaffRepository(impl: DefaultStaffRepository): StaffRepository

    @Binds
    fun bindTimetableRepository(impl: DefaultTimetableRepository): TimetableRepository

    @Binds
    fun bindSyllabusRepository(impl: DefaultSyllabusRepository): SyllabusRepository

    @Binds
    fun bindAdmissionsRepository(impl: DefaultAdmissionsRepository): AdmissionsRepository

    @Binds
    fun bindAttendanceRepository(impl: DefaultAttendanceRepository): AttendanceRepository

    @Binds
    fun bindLeaveRepository(impl: DefaultLeaveRepository): LeaveRepository

    @Binds
    fun bindDiaryRepository(impl: DefaultDiaryRepository): DiaryRepository

    @Binds
    fun bindFilesRepository(impl: DefaultFilesRepository): FilesRepository

    @Binds
    fun bindActivitiesRepository(impl: DefaultActivitiesRepository): ActivitiesRepository

    @Binds
    fun bindNoticesRepository(impl: DefaultNoticesRepository): NoticesRepository

    @Binds
    fun bindMessagesRepository(impl: DefaultMessagesRepository): MessagesRepository

    @Binds
    fun bindComplaintsRepository(impl: DefaultComplaintsRepository): ComplaintsRepository

    @Binds
    fun bindMeetingsRepository(impl: DefaultMeetingsRepository): MeetingsRepository

    @Binds
    fun bindHealthRepository(impl: DefaultHealthRepository): HealthRepository

    @Binds
    fun bindPickupRepository(impl: DefaultPickupRepository): PickupRepository

    @Binds
    fun bindNotificationPreferencesRepository(impl: DefaultNotificationPreferencesRepository): NotificationPreferencesRepository
}
