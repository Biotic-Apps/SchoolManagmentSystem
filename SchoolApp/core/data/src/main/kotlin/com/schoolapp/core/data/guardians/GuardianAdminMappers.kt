package com.schoolapp.core.data.guardians

import com.schoolapp.core.model.guardians.GuardianChild
import com.schoolapp.core.model.guardians.GuardianDetail
import com.schoolapp.core.model.guardians.GuardianLogin
import com.schoolapp.core.model.guardians.LoginSlipPreview
import com.schoolapp.core.model.people.Guardian
import com.schoolapp.core.network.guardians.GuardianDetailDto
import com.schoolapp.core.network.guardians.LoginSlipPreviewDto
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent

internal fun GuardianDetailDto.toModel() = GuardianDetail(
    guardian = Guardian(id, name, relation, phone, email, occupation, address, hasAccount),
    cnic = cnic,
    login = login?.let { GuardianLogin(it.email, it.phone, it.status, it.mustChangePassword, it.lastLoginAt) },
    children = children.map {
        GuardianChild(it.linkId, it.studentId, it.admissionNo, it.name, it.className, it.sectionName, it.relation, it.status)
    },
)

internal fun LoginSlipPreviewDto.toModel() = LoginSlipPreview(students, slips, create, reset, keep, skip, loginUrl)

@Module
@InstallIn(SingletonComponent::class)
internal abstract class GuardianAdminDataModule {
    @Binds
    abstract fun bind(impl: DefaultGuardianAdminRepository): GuardianAdminRepository
}
