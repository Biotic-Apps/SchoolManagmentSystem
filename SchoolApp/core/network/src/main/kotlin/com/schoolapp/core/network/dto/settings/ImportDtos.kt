package com.schoolapp.core.network.dto.settings

import kotlinx.serialization.Serializable

/** `{ importId }` of POST `/imports`. */
@Serializable
data class ImportCreatedDto(val importId: String? = null, val id: String? = null)

/** Body of POST `/imports/:id/commit`. */
@Serializable
data class CommitImportBodyDto(val skipInvalid: Boolean? = null)
