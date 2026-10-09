package com.schoolapp.core.model.dashboard

/** The child's most recent published exam result. */
data class LatestResult(
    val examId: String,
    val examName: String,
    val percent: Double,
    val grade: String,
    val position: Int?,
    val passed: Boolean,
    val publishedAt: String?,
)

/** Homework still due; [nextDueDate] is `YYYY-MM-DD`. */
data class HomeworkDue(val dueCount: Int, val nextDueDate: String?)
