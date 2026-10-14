package com.schoolapp.core.model.schools

/** A school (tenant) as the super admin sees it. [status] is ACTIVE or ARCHIVED. */
data class School(
    val id: String,
    val code: String,
    val name: String,
    val address: String?,
    val phone: String?,
    val email: String?,
    val website: String?,
    val logoUrl: String?,
    val status: String,
    val branchCount: Int,
    val createdAt: String?,
) {
    val isActive: Boolean get() = status == STATUS_ACTIVE

    companion object {
        const val STATUS_ACTIVE = "ACTIVE"
        const val STATUS_ARCHIVED = "ARCHIVED"
    }
}

/** One page of schools; [total] is the server's match count when it sent one. */
data class SchoolPage(val items: List<School>, val total: Int?, val page: Int, val pageSize: Int) {
    val hasMore: Boolean get() = total?.let { page * pageSize < it } ?: (items.size == pageSize)
}

/** Edit form values (code is fixed after creation). [logo] says what to do with the logo. */
data class SchoolUpdate(
    val name: String,
    val address: String?,
    val phone: String?,
    val email: String?,
    val website: String?,
    val logo: LogoChange = LogoChange.Keep,
)

sealed interface LogoChange {
    data object Keep : LogoChange
    data object Remove : LogoChange
    data class Replace(val fileId: String) : LogoChange
}
