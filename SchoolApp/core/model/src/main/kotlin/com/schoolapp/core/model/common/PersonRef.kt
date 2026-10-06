package com.schoolapp.core.model.common

/** `{ id, name }` reference to a user, staff member, student or guardian. */
data class PersonRef(val id: String?, val name: String)
