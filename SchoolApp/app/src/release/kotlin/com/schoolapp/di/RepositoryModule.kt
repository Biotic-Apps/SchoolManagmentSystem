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
}
