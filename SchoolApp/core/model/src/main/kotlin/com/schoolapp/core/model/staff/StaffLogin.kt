package com.schoolapp.core.model.staff

/** Sign-in created or reset for a staff member; [temporaryPassword] is shown once (null = existing login linked). */
data class StaffLogin(val userId: String, val email: String?, val phone: String?, val temporaryPassword: String?)
