package com.schoolapp.core.data.academics

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.result.map
import com.schoolapp.core.model.academics.ClassSetup
import com.schoolapp.core.model.academics.ClassSubject
import com.schoolapp.core.model.academics.ClassSubjectInput
import com.schoolapp.core.model.academics.NewSection
import com.schoolapp.core.model.academics.SectionChange
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.AcademicsApi
import com.schoolapp.core.network.dto.academics.ClassSubjectItemRequest
import com.schoolapp.core.network.dto.academics.SetClassSubjectsRequest
import com.schoolapp.core.network.dto.academics.CreateClassRequest
import com.schoolapp.core.network.dto.academics.CreateSectionRequest
import com.schoolapp.core.network.dto.academics.RenameRequest
import com.schoolapp.core.network.dto.academics.ReorderClassesRequest
import com.schoolapp.core.network.requireSuccess
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DefaultClassStructureRepository @Inject constructor(
    private val api: AcademicsApi,
    private val apiCaller: ApiCaller,
) : ClassStructureRepository {

    override suspend fun createClass(schoolId: String, name: String, levelOrder: Int): AppResult<String> =
        apiCaller.call { api.createClass(CreateClassRequest(schoolId, name.trim(), levelOrder)).data.id }

    override suspend fun renameClass(classId: String, name: String): AppResult<Unit> =
        apiCaller.call { api.renameClass(classId, RenameRequest(name.trim())) }.map { }

    override suspend fun reorderClasses(classIds: List<String>): AppResult<Unit> =
        apiCaller.call { api.reorderClasses(ReorderClassesRequest(classIds)).requireSuccess() }

    override suspend fun classSetup(classId: String, branchId: String, sessionId: String?): AppResult<ClassSetup> =
        apiCaller.call { api.classSetup(classId, branchId, sessionId).data.toSetup() }

    override suspend fun setClassSubjects(classId: String, items: List<ClassSubjectInput>): AppResult<List<ClassSubject>> =
        apiCaller.call {
            val body = items.map { ClassSubjectItemRequest(it.subjectId, it.periodsPerWeek, it.isOptional, it.group) }
            api.setClassSubjects(classId, SetClassSubjectsRequest(body)).data.sortedBy { it.sortOrder }.map { it.toSubject() }
        }

    override suspend fun addSection(section: NewSection): AppResult<Unit> = apiCaller.call {
        api.createSection(
            CreateSectionRequest(section.branchId, section.sessionId, section.classId, section.name, section.capacity, section.group),
        )
    }.map { }

    override suspend fun updateSection(sectionId: String, change: SectionChange): AppResult<Unit> =
        apiCaller.call { api.updateSection(sectionId, change.toBody()) }.map { }

    override suspend fun archiveSection(sectionId: String): AppResult<Unit> =
        apiCaller.call { api.archiveSection(sectionId) }.map { }
}

/** Explicit JSON nulls: a missing key means "unchanged" to the API, null clears the room or group. */
internal fun SectionChange.toBody(): JsonObject = when (this) {
    is SectionChange.Capacity -> JsonObject(mapOf("capacity" to JsonPrimitive(seats)))
    is SectionChange.Room -> JsonObject(mapOf("roomId" to (roomId?.let(::JsonPrimitive) ?: JsonNull)))
    is SectionChange.Group -> JsonObject(mapOf("group" to (group?.let(::JsonPrimitive) ?: JsonNull)))
    is SectionChange.Name -> JsonObject(mapOf("name" to JsonPrimitive(name.trim())))
}
