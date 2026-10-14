package com.schoolapp.core.data.homework

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.common.clean
import com.schoolapp.core.data.common.orNullIfEmpty
import com.schoolapp.core.model.homework.Homework
import com.schoolapp.core.model.homework.HomeworkChange
import com.schoolapp.core.model.homework.HomeworkSubmission
import com.schoolapp.core.model.homework.NewHomework
import com.schoolapp.core.model.homework.SubmissionGrade
import com.schoolapp.core.model.organisation.Subject
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.homework.CreateHomeworkBody
import com.schoolapp.core.network.homework.GradeSubmissionBody
import com.schoolapp.core.network.homework.HomeworkApi
import com.schoolapp.core.network.homework.ReturnSubmissionBody
import com.schoolapp.core.network.homework.SubmitHomeworkBody
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import javax.inject.Inject
import javax.inject.Singleton

/** Network calls run on the IO dispatcher inside [ApiCaller]. */
@Singleton
class DefaultHomeworkRepository @Inject constructor(
    private val api: HomeworkApi,
    private val apiCaller: ApiCaller,
) : HomeworkRepository {

    private val _changes = MutableSharedFlow<HomeworkChange>(extraBufferCapacity = 4)
    override val changes: SharedFlow<HomeworkChange> = _changes.asSharedFlow()

    override suspend fun list(sectionId: String): AppResult<List<Homework>> =
        apiCaller.call { api.list(sectionId).data.map { it.toModel() }.sortedByDescending { it.dueDate } }

    override suspend fun create(input: NewHomework): AppResult<Homework> = apiCaller.call {
        val body = CreateHomeworkBody(
            sectionId = input.sectionId,
            subjectId = input.subjectId,
            title = input.title.trim(),
            description = input.description.trim(),
            dueDate = input.dueDate,
            maxMarks = input.maxMarks,
            attachmentFileIds = input.attachmentFileIds.orNullIfEmpty(),
        )
        api.create(body).data.toModel()
    }.also { it.notify(HomeworkChange.ASSIGNED) }

    override suspend fun submissions(homeworkId: String): AppResult<List<HomeworkSubmission>> = apiCaller.call {
        api.submissions(homeworkId).data.map { it.toModel() }.sortedBy { it.student?.name?.lowercase() }
    }

    override suspend fun grade(submissionId: String, grade: SubmissionGrade): AppResult<HomeworkSubmission> = apiCaller.call {
        api.grade(submissionId, GradeSubmissionBody(grade.marks, grade.grade.clean(), grade.feedback.clean())).data.toModel()
    }.also { it.notify(HomeworkChange.GRADED) }

    override suspend fun returnSubmission(submissionId: String, feedback: String): AppResult<HomeworkSubmission> = apiCaller.call {
        api.returnSubmission(submissionId, ReturnSubmissionBody(feedback.trim())).data.toModel()
    }.also { it.notify(HomeworkChange.RETURNED) }

    override suspend fun forStudent(studentId: String): AppResult<List<Homework>> =
        apiCaller.call { api.forStudent(studentId).data.map { it.toModel() }.sortedByDescending { it.dueDate } }

    override suspend fun studentSubmission(homeworkId: String, studentId: String): AppResult<HomeworkSubmission?> =
        apiCaller.call { api.studentSubmission(homeworkId, studentId).data?.toModel() }

    override suspend fun submit(
        homeworkId: String,
        studentId: String,
        text: String?,
        fileIds: List<String>,
    ): AppResult<HomeworkSubmission> = apiCaller.call {
        api.submit(homeworkId, studentId, SubmitHomeworkBody(text.clean(), fileIds.orNullIfEmpty())).data.toModel()
    }.also { it.notify(HomeworkChange.SUBMITTED) }

    override suspend fun classSubjects(classId: String): AppResult<List<Subject>> =
        apiCaller.call { api.classSubjects(classId).data.map { it.toModel() }.sortedBy { it.name.lowercase() } }

    private fun AppResult<*>.notify(change: HomeworkChange) {
        if (this is AppResult.Success) _changes.tryEmit(change)
    }
}
