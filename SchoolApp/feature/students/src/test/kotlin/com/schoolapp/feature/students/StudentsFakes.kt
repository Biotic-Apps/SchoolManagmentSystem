package com.schoolapp.feature.students

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.people.GuardiansRepository
import com.schoolapp.core.data.people.StudentsRepository
import com.schoolapp.core.model.people.ChildLinkChallenge
import com.schoolapp.core.model.people.ChildLinkRequest
import com.schoolapp.core.model.people.ContactChange
import com.schoolapp.core.model.people.Guardian
import com.schoolapp.core.model.people.GuardianRelation
import com.schoolapp.core.model.people.StudentDetail
import com.schoolapp.core.model.people.StudentSummary

internal fun studentDetail(id: String, name: String) = StudentDetail(
    StudentSummary(id, "ADM-$id", name, null, null, null, "Class 5", "A", "s1", 1, "ACTIVE", null, null),
    null, null, null, null, null, emptyList(), emptyList(),
)

internal class FakeStudentsRepository : StudentsRepository {
    val requested = mutableListOf<String>()
    override suspend fun students(sectionId: String?, search: String?): AppResult<List<StudentSummary>> = AppResult.Success(emptyList())
    override suspend fun student(id: String): AppResult<StudentDetail> {
        requested += id
        return AppResult.Success(studentDetail(id, "Child $id"))
    }
}

internal class FakeGuardiansRepository : GuardiansRepository {
    val starts = mutableListOf<Triple<String, String, GuardianRelation>>()
    val confirms = mutableListOf<Pair<String, String>>()
    var confirmError: AppError? = null

    override suspend fun guardians(search: String?): AppResult<List<Guardian>> = AppResult.Success(emptyList())
    override suspend fun pendingChildLinks(): AppResult<List<ChildLinkRequest>> = AppResult.Success(emptyList())
    override suspend fun startChildLink(admissionNo: String, dob: String, relation: GuardianRelation): AppResult<ChildLinkChallenge> {
        starts += Triple(admissionNo, dob, relation)
        return AppResult.Success(ChildLinkChallenge("req-1", "0300*****12"))
    }
    override suspend fun confirmChildLink(requestId: String, code: String): AppResult<Unit> {
        confirmError?.let { return AppResult.Failure(it) }
        confirms += requestId to code
        return AppResult.Success(Unit)
    }
    override suspend fun requestContactChange(change: ContactChange): AppResult<Unit> = AppResult.Success(Unit)
}
