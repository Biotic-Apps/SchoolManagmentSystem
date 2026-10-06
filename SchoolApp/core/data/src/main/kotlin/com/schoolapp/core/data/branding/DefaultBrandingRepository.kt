package com.schoolapp.core.data.branding

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.result.map
import com.schoolapp.core.datastore.branding.BrandingCache
import com.schoolapp.core.model.branding.Branding
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.BrandingApi
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.distinctUntilChanged
import javax.inject.Inject
import javax.inject.Singleton

/** Serves the cached branding immediately; a failed refresh keeps the last good copy. */
@Singleton
class DefaultBrandingRepository @Inject constructor(
    private val api: BrandingApi,
    private val apiCaller: ApiCaller,
    private val cache: BrandingCache,
) : BrandingRepository {

    override val branding: Flow<Branding?> = cache.branding.distinctUntilChanged()

    override suspend fun refresh(schoolId: String?): AppResult<Unit> {
        val result = apiCaller.call { api.branding(schoolId?.takeIf { it.isNotBlank() }).data.toModel() }
        if (result is AppResult.Success) cache.save(result.data)
        return result.map { }
    }
}
