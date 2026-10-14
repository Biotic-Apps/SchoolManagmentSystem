package com.schoolapp.feature.notices.components

import androidx.compose.runtime.Composable
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.model.notice.NoticeAudience
import com.schoolapp.feature.notices.R

/**
 * "School-wide", "Grade 5, Grade 6 · staff only", "2 branches · 3 sections"...
 * [nameOf] resolves ids to names when known; up to three names are listed, otherwise a count.
 */
@Composable
internal fun audienceSummary(audience: NoticeAudience, nameOf: (String) -> String? = { null }): String {
    val staffOnly = stringResource(R.string.notices_staff_only)
    if (audience.schoolWide) {
        return listOfNotNull(stringResource(R.string.notices_school_wide), staffOnly.takeIf { audience.staffOnly }).joinToString(" · ")
    }
    val parts = listOfNotNull(
        part(audience.branchIds, nameOf, R.plurals.notices_branches_count),
        part(audience.classIds, nameOf, R.plurals.notices_classes_count),
        part(audience.sectionIds, nameOf, R.plurals.notices_sections_count),
        part(audience.guardianIds, { null }, R.plurals.notices_parents_count),
    )
    if (parts.isEmpty()) return if (audience.staffOnly) staffOnly else stringResource(R.string.notices_no_audience)
    return (parts + listOfNotNull(staffOnly.lowercase().takeIf { audience.staffOnly })).joinToString(" · ")
}

@Composable
private fun part(ids: List<String>, nameOf: (String) -> String?, plural: Int): String? {
    if (ids.isEmpty()) return null
    val names = ids.mapNotNull(nameOf)
    if (names.size == ids.size && names.size <= MAX_NAMES) return names.joinToString(", ")
    return pluralStringResource(plural, ids.size, ids.size)
}

private const val MAX_NAMES = 3
