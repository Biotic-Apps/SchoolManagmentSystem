package com.schoolapp.core.data.exams.skills

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.exams.SkillGrid
import com.schoolapp.core.model.exams.SkillRating

/** Behaviour & skills ratings (class teacher / section teachers). */
interface SkillsRepository {
    suspend fun grid(examId: String, sectionId: String): AppResult<SkillGrid>

    /** Saves only the changed cells; returns the fresh grid. */
    suspend fun save(examId: String, sectionId: String, ratings: List<SkillRating>): AppResult<SkillGrid>
}
