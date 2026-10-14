package com.schoolapp.core.model.guardians

/** Who bulk parent login slips print for: one section, one class, or the whole branch. */
data class LoginSlipTarget(val branchId: String?, val classId: String? = null, val sectionId: String? = null)

/** `POST /guardians/login-slips/preview`: what printing would change, before anything does. */
data class LoginSlipPreview(
    val students: Int,
    val slips: Int,
    /** Parents getting a new sign-in with a temporary password. */
    val create: Int,
    /** Parents who never signed in: temporary password replaced. */
    val reset: Int,
    /** Parents who already sign in: unchanged. */
    val keep: Int,
    /** No verified guardian, or sign-in disabled. */
    val skip: Int,
    val loginUrl: String?,
) {
    val changes: Int get() = create + reset
}
