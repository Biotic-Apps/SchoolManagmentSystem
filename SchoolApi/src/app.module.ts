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
import { SchoolSetupModule } from './modules/school-setup/school-setup.module';
import { StaffModule } from './modules/staff/staff.module';
import { StudentsModule } from './modules/students/students.module';
import { TimetableModule } from './modules/timetable/timetable.module';
import { UsersModule } from './modules/users/users.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { GeneratedDocsModule } from './modules/generated-docs/generated-docs.module';
import { HomeworkModule } from './modules/homework/homework.module';
import { FinanceCoreModule } from './modules/finance-core/finance-core.module';
import { ResultsModule } from './modules/results/results.module';
import { FeesModule } from './modules/fees/fees.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { PayrollModule } from './modules/payroll/payroll.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { IncomeModule } from './modules/income/income.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { CertificatesModule } from './modules/certificates/certificates.module';
import { HrLettersModule } from './modules/hr-letters/hr-letters.module';
import { ReportsModule } from './modules/reports/reports.module';
import { SchoolSettingsCoreModule } from './core/school-settings/school-settings-core.module';
import { SettingsModule } from './modules/settings/settings.module';
import { SupportModule } from './modules/support/support.module';
import { BackupsModule } from './modules/backups/backups.module';
import { ImportsModule } from './modules/imports/imports.module';
import { SmsGatewayModule } from './modules/sms-gateway/sms-gateway.module';
import { QuestionBankModule } from './modules/question-bank/question-bank.module';

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
    SchoolSetupModule,
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
    SchoolDayModule,
    AttendanceModule,
    StaffAttendanceModule,
    LeaveModule,
    DiaryModule,
    HomeworkModule,
    StudentHealthModule,
    PickupModule,
    ComplaintsModule,
    MeetingsModule,
    ActivitiesModule,
    NoticesModule,
    MessagingModule,
    TasksModule,
    GeneratedDocsModule,
    FinanceCoreModule,
    ResultsModule,
    FeesModule,
    PaymentsModule,
    PayrollModule,
    ExpensesModule,
    IncomeModule,
    InventoryModule,
    CertificatesModule,
    HrLettersModule,
    ReportsModule,
    SchoolSettingsCoreModule,
    SettingsModule,
    SupportModule,
    BackupsModule,
    ImportsModule,
    SmsGatewayModule,
    QuestionBankModule,
  ],
})
export class AppModule {}
