package com.schoolapp.core.data.staff

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.result.map
import com.schoolapp.core.model.staff.ClassAllocation
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.AllocationApi
import com.schoolapp.core.network.dto.allocation.SetTeacherRequest
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DefaultAllocationRepository @Inject constructor(
    private val api: AllocationApi,
    private val apiCaller: ApiCaller,
) : AllocationRepository {

    override suspend fun classAllocation(classId: String, branchId: String): AppResult<ClassAllocation> =
        apiCaller.call { api.classSetup(classId, branchId).data.toModel() }

    override suspend fun setClassTeacher(sectionId: String, staffId: String): AppResult<Unit> =
        apiCaller.call { api.setClassTeacher(sectionId, SetTeacherRequest(staffId)) }.map { }

    override suspend fun setSubjectTeacher(sectionId: String, subjectId: String, staffId: String): AppResult<Unit> =
        apiCaller.call { api.setSubjectTeacher(sectionId, subjectId, SetTeacherRequest(staffId)) }.map { }
}
