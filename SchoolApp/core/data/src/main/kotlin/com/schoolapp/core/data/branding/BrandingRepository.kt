package com.schoolapp.core.data.branding

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.branding.Branding
import kotlinx.coroutines.flow.Flow

interface BrandingRepository {
    /** Last known branding (cached across launches); null until the first successful fetch. */
    val branding: Flow<Branding?>

    /** Fetches `/branding` for [schoolId] (null = the server's default school, used on the login screen). */
    suspend fun refresh(schoolId: String?): AppResult<Unit>
}
