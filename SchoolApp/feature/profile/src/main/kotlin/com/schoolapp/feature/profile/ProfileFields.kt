package com.schoolapp.feature.profile

import androidx.compose.runtime.Immutable

@Immutable
data class ProfileFields(val name: String = "", val email: String = "", val phone: String = "") {
    fun trimmed() = ProfileFields(name.trim(), email.trim(), phone.trim())
}
