package com.schoolapp.core.data.academics

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.academics.CatalogueSubject
import com.schoolapp.core.model.academics.Room
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.AcademicsApi
import com.schoolapp.core.network.dto.academics.CreateRoomRequest
import com.schoolapp.core.network.dto.academics.CreateSubjectRequest
import com.schoolapp.core.network.dto.academics.RenameRequest
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DefaultCatalogueRepository @Inject constructor(
    private val api: AcademicsApi,
    private val apiCaller: ApiCaller,
) : CatalogueRepository {

    override suspend fun subjects(schoolId: String?): AppResult<List<CatalogueSubject>> =
        apiCaller.call { api.subjects(schoolId).data.map { it.toCatalogue() }.sortedBy { it.name.lowercase() } }

    override suspend fun createSubject(schoolId: String, name: String, classIds: List<String>, periodsPerWeek: Int?): AppResult<CatalogueSubject> =
        apiCaller.call {
            val body = CreateSubjectRequest(schoolId, name.trim(), classIds.takeIf { it.isNotEmpty() }, periodsPerWeek)
            api.createSubject(body).data.toCatalogue()
        }

    override suspend fun renameSubject(subjectId: String, name: String): AppResult<CatalogueSubject> =
        apiCaller.call { api.renameSubject(subjectId, RenameRequest(name.trim())).data.toCatalogue() }

    override suspend fun rooms(branchId: String): AppResult<List<Room>> =
        apiCaller.call { api.rooms(branchId).data.map { it.toModel() }.sortedBy { it.name.lowercase() } }

    override suspend fun createRoom(branchId: String, name: String, capacity: Int?): AppResult<Room> =
        apiCaller.call { api.createRoom(CreateRoomRequest(branchId, name.trim(), capacity)).data.toModel() }

    override suspend fun updateRoom(roomId: String, name: String, capacity: Int?): AppResult<Room> =
        apiCaller.call { api.updateRoom(roomId, RenameRequest(name.trim(), capacity)).data.toModel() }
}
