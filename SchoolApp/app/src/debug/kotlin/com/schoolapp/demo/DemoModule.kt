package com.schoolapp.demo

import com.schoolapp.core.data.applock.AppLockRepository
import com.schoolapp.core.data.applock.DefaultAppLockRepository
import com.schoolapp.core.data.approvals.ApprovalsRepository
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.branding.BrandingRepository
import com.schoolapp.core.data.dashboard.DashboardRepository
import com.schoolapp.core.data.notifications.NotificationsRepository
import com.schoolapp.core.data.organisation.OrganisationRepository
import com.schoolapp.core.data.profile.ProfileRepository
import com.schoolapp.core.data.people.StudentsRepository
import com.schoolapp.core.data.people.GuardiansRepository
import com.schoolapp.core.data.staff.StaffRepository
import com.schoolapp.core.data.timetable.TimetableRepository
import com.schoolapp.core.data.syllabus.SyllabusRepository
import com.schoolapp.core.data.admissions.AdmissionsRepository
import com.schoolapp.core.data.attendance.AttendanceRepository
import com.schoolapp.core.data.attendance.StaffAttendanceRepository
import com.schoolapp.core.data.leave.LeaveRepository
import com.schoolapp.core.data.diary.DiaryRepository
import com.schoolapp.core.data.files.FilesRepository
import com.schoolapp.core.data.activities.ActivitiesRepository
import com.schoolapp.core.data.notices.NoticesRepository
import com.schoolapp.core.data.messages.MessagesRepository
import com.schoolapp.core.data.complaints.ComplaintsRepository
import com.schoolapp.core.data.meetings.MeetingsRepository
import com.schoolapp.core.data.health.HealthRepository
import com.schoolapp.core.data.pickup.PickupRepository
import com.schoolapp.core.data.notifications.NotificationPreferencesRepository
import com.schoolapp.core.data.exams.ExamsRepository
import com.schoolapp.core.data.progress.ProgressRepository
import com.schoolapp.core.data.fees.FeesRepository
import com.schoolapp.core.data.payroll.PayrollRepository
import com.schoolapp.core.data.certificates.CertificatesRepository
import com.schoolapp.ui.LoginFooterContent
import com.schoolapp.core.data.calendar.StudentCalendarRepository
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent

/** Debug builds route data through demo-aware wrappers and add the role picker to login. */
@Module
@InstallIn(SingletonComponent::class)
interface DemoModule {
    @Binds
    fun bindAuthRepository(impl: DemoAwareAuthRepository): AuthRepository

    @Binds
    fun bindProfileRepository(impl: DemoAwareProfileRepository): ProfileRepository

    @Binds
    fun bindDashboardRepository(impl: DemoAwareDashboardRepository): DashboardRepository

    @Binds
    fun bindApprovalsRepository(impl: DemoAwareApprovalsRepository): ApprovalsRepository

    @Binds
    fun bindNotificationsRepository(impl: DemoAwareNotificationsRepository): NotificationsRepository

    @Binds
    fun bindOrganisationRepository(impl: DemoAwareOrganisationRepository): OrganisationRepository

    @Binds
    fun bindStudentsRepository(impl: DemoAwareStudentsRepository): StudentsRepository

    @Binds
    fun bindGuardiansRepository(impl: DemoAwareGuardiansRepository): GuardiansRepository

    @Binds
    fun bindStaffRepository(impl: DemoAwareStaffRepository): StaffRepository

    @Binds
    fun bindTimetableRepository(impl: DemoAwareTimetableRepository): TimetableRepository

    @Binds
    fun bindStudentCalendarRepository(impl: DemoAwareStudentCalendarRepository): StudentCalendarRepository

    @Binds
    fun bindSyllabusRepository(impl: DemoAwareSyllabusRepository): SyllabusRepository

    @Binds
    fun bindAdmissionsRepository(impl: DemoAwareAdmissionsRepository): AdmissionsRepository

    @Binds
    fun bindAttendanceRepository(impl: DemoAwareAttendanceRepository): AttendanceRepository

    @Binds
    fun bindStaffAttendanceRepository(impl: DemoAwareStaffAttendanceRepository): StaffAttendanceRepository

    @Binds
    fun bindLeaveRepository(impl: DemoAwareLeaveRepository): LeaveRepository

    @Binds
    fun bindDiaryRepository(impl: DemoAwareDiaryRepository): DiaryRepository

    @Binds
    fun bindFilesRepository(impl: DemoAwareFilesRepository): FilesRepository

    @Binds
    fun bindActivitiesRepository(impl: DemoAwareActivitiesRepository): ActivitiesRepository

    @Binds
    fun bindNoticesRepository(impl: DemoAwareNoticesRepository): NoticesRepository

    @Binds
    fun bindMessagesRepository(impl: DemoAwareMessagesRepository): MessagesRepository

    @Binds
    fun bindComplaintsRepository(impl: DemoAwareComplaintsRepository): ComplaintsRepository

    @Binds
    fun bindMeetingsRepository(impl: DemoAwareMeetingsRepository): MeetingsRepository

    @Binds
    fun bindHealthRepository(impl: DemoAwareHealthRepository): HealthRepository

    @Binds
    fun bindPickupRepository(impl: DemoAwarePickupRepository): PickupRepository

    @Binds
    fun bindNotificationPreferencesRepository(impl: DemoAwareNotificationPreferencesRepository): NotificationPreferencesRepository

    @Binds
    fun bindExamsRepository(impl: DemoAwareExamsRepository): ExamsRepository

    @Binds
    fun bindProgressRepository(impl: DemoAwareProgressRepository): ProgressRepository

    @Binds
    fun bindFeesRepository(impl: DemoAwareFeesRepository): FeesRepository

    @Binds
    fun bindPayrollRepository(impl: DemoAwarePayrollRepository): PayrollRepository

    @Binds
    fun bindCertificatesRepository(impl: DemoAwareCertificatesRepository): CertificatesRepository

    @Binds
    fun bindBrandingRepository(impl: DemoAwareBrandingRepository): BrandingRepository

    /** Device setting, not demo data: the real repository in both build types. */
    @Binds
    fun bindAppLockRepository(impl: DefaultAppLockRepository): AppLockRepository

    @Binds
    fun bindLoginFooter(impl: DemoLoginFooter): LoginFooterContent
}
