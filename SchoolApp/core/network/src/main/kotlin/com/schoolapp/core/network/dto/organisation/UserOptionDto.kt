package com.schoolapp.core.network.dto.organisation

import kotlinx.serialization.Serializable

/** A row of GET /users used as a picker option (e.g. principals). */
@Serializable
data class UserOptionDto(val id: String, val name: String? = null, val email: String? = null)
