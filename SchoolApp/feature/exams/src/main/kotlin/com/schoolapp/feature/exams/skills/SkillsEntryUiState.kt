package com.schoolapp.feature.exams.skills

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.exams.SkillGrid
import com.schoolapp.core.model.exams.SkillRating

@Immutable
data class SkillsEntryUiState(
    val title: String = "",
    val isLoading: Boolean = true,
    val error: AppError? = null,
    val grid: SkillGrid? = null,
    /** Unsaved cells: "studentId:itemId" → value (null = cleared). */
    val edits: Map<String, Int?> = emptyMap(),
    val canEdit: Boolean = false,
    val saving: Boolean = false,
    val saveError: AppError? = null,
    val saved: Boolean = false,
    /** Student whose card is open; null = the list. */
    val openStudentId: String? = null,
) {
    val editable: Boolean get() = canEdit && grid?.editable == true

    fun valueOf(studentId: String, itemId: String): Int? {
        val key = cellKey(studentId, itemId)
        return if (edits.containsKey(key)) edits[key] else grid?.students?.firstOrNull { it.studentId == studentId }?.ratings?.get(itemId)
    }

    /** Items rated for a student, counting unsaved edits. */
    fun ratedCount(studentId: String): Int = grid?.items.orEmpty().count { valueOf(studentId, it.id) != null }

    val changes: List<SkillRating>
        get() = edits.map { (key, value) ->
            val (studentId, itemId) = key.split(":")
            SkillRating(studentId, itemId, value)
        }

    companion object {
        fun cellKey(studentId: String, itemId: String) = "$studentId:$itemId"
    }
}
