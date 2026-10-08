package com.schoolapp.di

import com.schoolapp.core.data.applock.AppLockRepository
import com.schoolapp.core.data.applock.DefaultAppLockRepository
import com.schoolapp.core.data.approvals.ApprovalsRepository
import com.schoolapp.core.data.approvals.DefaultApprovalsRepository
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.auth.DefaultAuthRepository
import com.schoolapp.core.data.branding.BrandingRepository
import com.schoolapp.core.data.branding.DefaultBrandingRepository
import com.schoolapp.core.data.dashboard.DashboardRepository
import com.schoolapp.core.data.dashboard.DefaultDashboardRepository
import com.schoolapp.core.data.setup.DefaultSetupRepository
import com.schoolapp.core.data.setup.SetupRepository
import com.schoolapp.core.data.notifications.DefaultNotificationsRepository
import com.schoolapp.core.data.notifications.NotificationsRepository
import com.schoolapp.core.data.organisation.ClassesOverviewRepository
import com.schoolapp.core.data.organisation.DefaultClassesOverviewRepository
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
import com.schoolapp.core.data.staff.AllocationRepository
import com.schoolapp.core.data.staff.DefaultAllocationRepository
import com.schoolapp.core.data.staff.DefaultStaffAdminRepository
import com.schoolapp.core.data.staff.StaffAdminRepository
import com.schoolapp.core.data.timetable.BellScheduleRepository
import com.schoolapp.core.data.timetable.DefaultBellScheduleRepository
import com.schoolapp.core.data.timetable.TimetableRepository
import com.schoolapp.core.data.timetable.DefaultTimetableRepository
import com.schoolapp.core.data.syllabus.SyllabusRepository
import com.schoolapp.core.data.syllabus.DefaultSyllabusRepository
import com.schoolapp.core.data.admissions.AdmissionsRepository
import com.schoolapp.core.data.admissions.DefaultAdmissionsRepository
import com.schoolapp.core.data.attendance.AttendanceRepository
import com.schoolapp.core.data.attendance.DefaultAttendanceRepository
import com.schoolapp.core.data.attendance.DefaultStaffAttendanceRepository
import com.schoolapp.core.data.attendance.StaffAttendanceRepository
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
import com.schoolapp.core.data.exams.ExamsRepository
import com.schoolapp.core.data.exams.DefaultExamsRepository
import com.schoolapp.core.data.progress.ProgressRepository
import com.schoolapp.core.data.progress.DefaultProgressRepository
import com.schoolapp.core.data.fees.FeesRepository
import com.schoolapp.core.data.fees.DefaultFeesRepository
import com.schoolapp.core.data.payroll.PayrollRepository
import com.schoolapp.core.data.payroll.DefaultPayrollRepository
import com.schoolapp.core.data.certificates.CertificatesRepository
import com.schoolapp.core.data.certificates.DefaultCertificatesRepository
import com.schoolapp.core.data.calendar.DefaultStudentCalendarRepository
import com.schoolapp.core.data.calendar.StudentCalendarRepository
import com.schoolapp.core.data.academics.CatalogueRepository
import com.schoolapp.core.data.academics.ClassStructureRepository
import com.schoolapp.core.data.academics.DefaultCatalogueRepository
import com.schoolapp.core.data.academics.DefaultClassStructureRepository
import com.schoolapp.core.data.academics.DefaultTeacherAllocationRepository
import com.schoolapp.core.data.academics.TeacherAllocationRepository
import com.schoolapp.core.data.timetable.DefaultTimetableBuilderRepository
import com.schoolapp.core.data.timetable.TimetableBuilderRepository
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
    fun bindSetupRepository(impl: DefaultSetupRepository): SetupRepository

    @Binds
    fun bindApprovalsRepository(impl: DefaultApprovalsRepository): ApprovalsRepository

    @Binds
    fun bindNotificationsRepository(impl: DefaultNotificationsRepository): NotificationsRepository

    @Binds
    fun bindOrganisationRepository(impl: DefaultOrganisationRepository): OrganisationRepository

    @Binds
    fun bindClassesOverviewRepository(impl: DefaultClassesOverviewRepository): ClassesOverviewRepository

    @Binds
    fun bindStudentsRepository(impl: DefaultStudentsRepository): StudentsRepository

    @Binds
    fun bindGuardiansRepository(impl: DefaultGuardiansRepository): GuardiansRepository

    @Binds
    fun bindStaffRepository(impl: DefaultStaffRepository): StaffRepository

    @Binds
    fun bindStaffAdminRepository(impl: DefaultStaffAdminRepository): StaffAdminRepository

    @Binds
    fun bindAllocationRepository(impl: DefaultAllocationRepository): AllocationRepository

    @Binds
    fun bindClassStructureRepository(impl: DefaultClassStructureRepository): ClassStructureRepository

    @Binds
    fun bindTeacherAllocationRepository(impl: DefaultTeacherAllocationRepository): TeacherAllocationRepository

    @Binds
    fun bindCatalogueRepository(impl: DefaultCatalogueRepository): CatalogueRepository

    @Binds
    fun bindTimetableBuilderRepository(impl: DefaultTimetableBuilderRepository): TimetableBuilderRepository

    @Binds
    fun bindTimetableRepository(impl: DefaultTimetableRepository): TimetableRepository

    @Binds
    fun bindBellScheduleRepository(impl: DefaultBellScheduleRepository): BellScheduleRepository

    @Binds
    fun bindStudentCalendarRepository(impl: DefaultStudentCalendarRepository): StudentCalendarRepository

    @Binds
    fun bindSyllabusRepository(impl: DefaultSyllabusRepository): SyllabusRepository

    @Binds
    fun bindAdmissionsRepository(impl: DefaultAdmissionsRepository): AdmissionsRepository

    @Binds
    fun bindAttendanceRepository(impl: DefaultAttendanceRepository): AttendanceRepository

    @Binds
    fun bindStaffAttendanceRepository(impl: DefaultStaffAttendanceRepository): StaffAttendanceRepository

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

    @Binds
    fun bindExamsRepository(impl: DefaultExamsRepository): ExamsRepository

    @Binds
    fun bindProgressRepository(impl: DefaultProgressRepository): ProgressRepository

    @Binds
    fun bindFeesRepository(impl: DefaultFeesRepository): FeesRepository

    @Binds
    fun bindPayrollRepository(impl: DefaultPayrollRepository): PayrollRepository

    @Binds
    fun bindCertificatesRepository(impl: DefaultCertificatesRepository): CertificatesRepository

    @Binds
    fun bindBrandingRepository(impl: DefaultBrandingRepository): BrandingRepository

    @Binds
    fun bindAppLockRepository(impl: DefaultAppLockRepository): AppLockRepository
}
