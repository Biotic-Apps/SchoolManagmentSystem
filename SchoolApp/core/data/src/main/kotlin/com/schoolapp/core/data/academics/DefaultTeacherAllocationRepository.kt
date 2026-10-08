package com.schoolapp.core.data.academics

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.result.map
import com.schoolapp.core.model.academics.TeachingStaff
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.AcademicsApi
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DefaultTeacherAllocationRepository @Inject constructor(
    private val api: AcademicsApi,
    private val apiCaller: ApiCaller,
) : TeacherAllocationRepository {

    override suspend fun teachingStaff(branchId: String, sessionId: String?): AppResult<List<TeachingStaff>> =
        apiCaller.call { api.teachingStaff(branchId, sessionId).data.map { it.toModel() }.sortedBy { it.name } }

    override suspend fun setClassTeacher(sectionId: String, staffId: String?): AppResult<Unit> =
        apiCaller.call { api.setClassTeacher(sectionId, staffBody(staffId)) }.map { }

    override suspend fun setSubjectTeacher(sectionId: String, subjectId: String, staffId: String?): AppResult<Unit> =
        apiCaller.call { api.setSubjectTeacher(sectionId, subjectId, staffBody(staffId)) }.map { }

    /** `{ staffId: null }` must be sent explicitly to remove a teacher. */
    private fun staffBody(staffId: String?) = JsonObject(mapOf("staffId" to (staffId?.let(::JsonPrimitive) ?: JsonNull)))
}
