package com.schoolapp.core.model.activity

/** Who an activity is for: the whole branch, or any mix of its classes and sections. */
data class ActivityAudience(
    val wholeBranch: Boolean = false,
    val classIds: List<String> = emptyList(),
    val sectionIds: List<String> = emptyList(),
) {
    val isEmpty: Boolean get() = !wholeBranch && classIds.isEmpty() && sectionIds.isEmpty()
}
