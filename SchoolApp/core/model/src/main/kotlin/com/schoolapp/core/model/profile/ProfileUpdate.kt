package com.schoolapp.core.model.profile

/** Fields to change on `PATCH /me`; null means unchanged. */
data class ProfileUpdate(
    val name: String? = null,
    val email: String? = null,
    val phone: String? = null,
) {
    val isEmpty: Boolean get() = name == null && email == null && phone == null
}
