package com.schoolapp.core.model.exams

/** Report card behaviour & skills domains. */
enum class SkillDomain { AFFECTIVE, PSYCHOMOTOR }

data class SkillItem(val id: String, val domain: SkillDomain, val name: String)

/** One rating level; [value] 1 = lowest, [code] is printed on the card (e.g. "A"). */
data class SkillLevel(val value: Int, val code: String, val label: String)

data class SkillStudent(
    val studentId: String,
    val name: String,
    val rollNo: Int?,
    /** itemId → level value */
    val ratings: Map<String, Int>,
)

/** Ratings of one section for one exam; [editable] is false once results are published. */
data class SkillGrid(
    val examId: String,
    val sectionId: String,
    val editable: Boolean,
    val items: List<SkillItem>,
    /** Highest first. */
    val scale: List<SkillLevel>,
    val students: List<SkillStudent>,
    val complete: Int,
)

/** A change to send; [value] null clears the rating. */
data class SkillRating(val studentId: String, val itemId: String, val value: Int?)
