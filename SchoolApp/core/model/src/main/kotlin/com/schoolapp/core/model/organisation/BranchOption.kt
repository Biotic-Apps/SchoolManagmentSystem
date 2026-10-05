package com.schoolapp.core.model.organisation

/** A branch the user may browse, with the school it belongs to. */
data class BranchOption(val id: String, val name: String, val schoolId: String?)
