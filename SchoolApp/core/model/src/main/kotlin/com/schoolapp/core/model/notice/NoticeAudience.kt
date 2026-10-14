package com.schoolapp.core.model.notice

/** Who receives a notice: the whole school, or any mix of branches, classes and sections; optionally staff only. */
data class NoticeAudience(
    val schoolWide: Boolean = false,
    val branchIds: List<String> = emptyList(),
    val classIds: List<String> = emptyList(),
    val sectionIds: List<String> = emptyList(),
    val staffOnly: Boolean = false,
    val guardianIds: List<String> = emptyList(),
) {
    val hasTargets: Boolean
        get() = schoolWide || branchIds.isNotEmpty() || classIds.isNotEmpty() || sectionIds.isNotEmpty() || guardianIds.isNotEmpty()
}
