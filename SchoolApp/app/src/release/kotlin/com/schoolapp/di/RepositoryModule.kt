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
}
