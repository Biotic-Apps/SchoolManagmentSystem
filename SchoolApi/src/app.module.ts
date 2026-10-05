import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/app-config.module';
import { ApprovalsModule } from './core/approvals/approvals.module';
import { AuditModule } from './core/audit/audit.module';
import { AuthModule } from './core/auth/auth.module';
import { CacheModule } from './core/cache/cache.module';
import { CommonModule } from './core/common/common.module';
import { FilesModule } from './core/files/files.module';
import { HealthModule } from './core/health/health.module';
import { JobsModule } from './core/jobs/jobs.module';
import { NotificationsModule } from './core/notifications/notifications.module';
import { PrismaModule } from './core/prisma/prisma.module';
import { RbacModule } from './core/rbac/rbac.module';
import { ThrottlingModule } from './core/throttling/throttling.module';
import { AcademicSessionsModule } from './modules/academic-sessions/academic-sessions.module';
import { AcademicsModule } from './modules/academics/academics.module';
import { BranchesModule } from './modules/branches/branches.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { MeModule } from './modules/me/me.module';
import { RolesModule } from './modules/roles/roles.module';
import { SchoolsModule } from './modules/schools/schools.module';
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
  ],
})
export class AppModule {}
