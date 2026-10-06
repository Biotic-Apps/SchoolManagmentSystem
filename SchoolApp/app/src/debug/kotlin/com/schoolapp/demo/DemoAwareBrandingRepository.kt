package com.schoolapp.demo

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.branding.BrandingRepository
import com.schoolapp.core.data.branding.DefaultBrandingRepository
import com.schoolapp.core.model.branding.Branding
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.distinctUntilChanged
import javax.inject.Inject
import javax.inject.Singleton

/** Demo sessions show fixed branding without touching the network or the real cache. */
@Singleton
class DemoAwareBrandingRepository @Inject constructor(
    private val real: DefaultBrandingRepository,
    private val auth: DemoAwareAuthRepository,
) : BrandingRepository {

    override val branding: Flow<Branding?> =
        combine(auth.demoActive, real.branding) { demo, cached -> if (demo) DEMO else cached }.distinctUntilChanged()

    override suspend fun refresh(schoolId: String?): AppResult<Unit> =
        if (auth.isDemoActive) AppResult.Success(Unit) else real.refresh(schoolId)

    private companion object {
        val DEMO = Branding(
            schoolName = "Demo Public School",
            appName = null,
            logoUrl = null,
            primaryColor = "#7A2944",
            accentSoftColor = null,
        )
    }
}
