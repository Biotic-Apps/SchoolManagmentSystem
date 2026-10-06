package com.schoolapp.core.datastore.branding

import com.schoolapp.core.model.branding.Branding
import kotlinx.coroutines.flow.Flow

/** Last successfully fetched school branding. Public data, so it is stored unencrypted. */
interface BrandingCache {
    val branding: Flow<Branding?>

    suspend fun save(branding: Branding)
}
