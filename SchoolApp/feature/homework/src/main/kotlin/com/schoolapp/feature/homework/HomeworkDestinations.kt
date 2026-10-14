package com.schoolapp.feature.homework

import kotlinx.serialization.Serializable

/** Staff: assign homework to one section; [classId] loads the class subjects. */
@Serializable
internal data class AssignHomeworkDestination(val sectionId: String, val classId: String?, val sectionLabel: String)

/** Staff: one homework's submissions with grade / return. Header data is passed so no extra lookup is needed. */
@Serializable
internal data class HomeworkSubmissionsDestination(
    val homeworkId: String,
    val title: String,
    val subjectName: String,
    val dueDate: String,
    val maxMarks: Int? = null,
)

/** Parent: homework details, own submission + feedback, and the submit form. */
@Serializable
internal data class SubmitHomeworkDestination(val homeworkId: String, val studentId: String)
