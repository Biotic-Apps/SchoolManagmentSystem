package com.schoolapp.core.data.homework

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.homework.Homework
import com.schoolapp.core.model.homework.HomeworkChange
import com.schoolapp.core.model.homework.HomeworkSubmission
import com.schoolapp.core.model.homework.NewHomework
import com.schoolapp.core.model.homework.SubmissionGrade
import com.schoolapp.core.model.organisation.Subject
import kotlinx.coroutines.flow.SharedFlow

interface HomeworkRepository {
    /** Emits after every successful mutation so open lists can refresh. */
    val changes: SharedFlow<HomeworkChange>

    suspend fun list(sectionId: String): AppResult<List<Homework>>
    suspend fun create(input: NewHomework): AppResult<Homework>
    suspend fun submissions(homeworkId: String): AppResult<List<HomeworkSubmission>>
    suspend fun grade(submissionId: String, grade: SubmissionGrade): AppResult<HomeworkSubmission>
    suspend fun returnSubmission(submissionId: String, feedback: String): AppResult<HomeworkSubmission>

    suspend fun forStudent(studentId: String): AppResult<List<Homework>>
    suspend fun studentSubmission(homeworkId: String, studentId: String): AppResult<HomeworkSubmission?>
    suspend fun submit(homeworkId: String, studentId: String, text: String?, fileIds: List<String>): AppResult<HomeworkSubmission>

    /** Subjects taught in a class (assign form). */
    suspend fun classSubjects(classId: String): AppResult<List<Subject>>
}
