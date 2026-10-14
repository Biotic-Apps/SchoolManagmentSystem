package com.schoolapp.feature.questionbank

import kotlinx.serialization.Serializable

/** Add (no [questionId]) or edit a question of [schoolId]. */
@Serializable
internal data class QuestionFormDestination(val schoolId: String, val questionId: String? = null)

/** Paper generator form for [schoolId]. */
@Serializable
internal data class GeneratePaperDestination(val schoolId: String)

/** A generated paper: sections, picked questions, PDF download and publish. */
@Serializable
internal data class PaperDetailDestination(val paperId: String, val justGenerated: Boolean = false)
