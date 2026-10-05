package com.schoolapp.demo

import com.schoolapp.core.data.approvals.ApprovalsRepository
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.dashboard.DashboardRepository
import com.schoolapp.core.data.notifications.NotificationsRepository
import com.schoolapp.core.data.organisation.OrganisationRepository
import com.schoolapp.core.data.profile.ProfileRepository
import com.schoolapp.ui.LoginFooterContent
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
    fun bindLoginFooter(impl: DemoLoginFooter): LoginFooterContent
}
