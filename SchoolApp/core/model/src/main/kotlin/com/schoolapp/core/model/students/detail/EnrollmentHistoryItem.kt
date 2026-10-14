package com.schoolapp.core.model.students.detail

import com.schoolapp.core.model.people.Enrollment

/** One placement of `GET /students/:id/enrollments`, newest first; [reason] explains a withdrawal or move. */
data class EnrollmentHistoryItem(val enrollment: Enrollment, val reason: String?)
