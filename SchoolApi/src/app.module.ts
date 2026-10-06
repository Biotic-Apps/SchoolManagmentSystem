import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/app-config.module';
import { AccountsModule } from './core/accounts/accounts.module';
import { ApprovalsModule } from './core/approvals/approvals.module';
import { AuditModule } from './core/audit/audit.module';
import { AuthModule } from './core/auth/auth.module';
import { CacheModule } from './core/cache/cache.module';
import { CommonModule } from './core/common/common.module';
import { FilesModule } from './core/files/files.module';
import { HealthModule } from './core/health/health.module';
import { IdempotencyModule } from './core/idempotency/idempotency.module';
import { JobsModule } from './core/jobs/jobs.module';
import { NotificationsModule } from './core/notifications/notifications.module';
import { OtpModule } from './core/otp/otp.module';
import { OutboxModule } from './core/outbox/outbox.module';
import { PrismaModule } from './core/prisma/prisma.module';
import { ProbationModule } from './core/probation/probation.module';
import { RbacModule } from './core/rbac/rbac.module';
import { ThrottlingModule } from './core/throttling/throttling.module';
import { AcademicSessionsModule } from './modules/academic-sessions/academic-sessions.module';
import { AcademicsModule } from './modules/academics/academics.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { LeaveModule } from './modules/leave/leave.module';
import { StaffAttendanceModule } from './modules/staff-attendance/staff-attendance.module';
import { DiaryModule } from './modules/diary/diary.module';
import { StudentHealthModule } from './modules/health/health.module';
import { PickupModule } from './modules/pickup/pickup.module';
import { ComplaintsModule } from './modules/complaints/complaints.module';
import { MeetingsModule } from './modules/meetings/meetings.module';
import { ActivitiesModule } from './modules/activities/activities.module';
import { MessagingModule } from './modules/messaging/messaging.module';
import { NoticesModule } from './modules/notices/notices.module';
import { AdmissionsModule } from './modules/admissions/admissions.module';
import { BranchesModule } from './modules/branches/branches.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { GuardiansModule } from './modules/guardians/guardians.module';
import { MeModule } from './modules/me/me.module';
import { RolesModule } from './modules/roles/roles.module';
import { SchoolDayModule } from './modules/school-day/school-day.module';
import { SchoolsModule } from './modules/schools/schools.module';
import { StaffModule } from './modules/staff/staff.module';
import { StudentsModule } from './modules/students/students.module';
import { SyllabusModule } from './modules/syllabus/syllabus.module';
import { TimetableModule } from './modules/timetable/timetable.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    AppConfigModule,
    PrismaModule,
    CacheModule,
    JobsModule.forRoot(),
    CommonModule,
    ThrottlingModule,
    AuditModule,
    RbacModule,
    AuthModule,
    NotificationsModule,
    ApprovalsModule,
    ProbationModule,
    OutboxModule,
    OtpModule,
    IdempotencyModule,
    AccountsModule,
    FilesModule,
    HealthModule,
    MeModule,
    RolesModule,
    SchoolsModule,
    BranchesModule,
    UsersModule,
    AcademicSessionsModule,
    AcademicsModule,
    DashboardModule,
    DocumentsModule,
    StudentsModule,
    GuardiansModule,
    AdmissionsModule,
    StaffModule,
    TimetableModule,
    SyllabusModule,
    SchoolDayModule,
    AttendanceModule,
    StaffAttendanceModule,
    LeaveModule,
    DiaryModule,
    StudentHealthModule,
    PickupModule,
    ComplaintsModule,
    MeetingsModule,
    ActivitiesModule,
    NoticesModule,
    MessagingModule,
  ],
})
export class AppModule {}
