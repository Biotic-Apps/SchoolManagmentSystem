package com.schoolapp.core.data.schools

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.result.onSuccess
import com.schoolapp.core.model.schools.School
import com.schoolapp.core.model.schools.SchoolDeletionPreview
import com.schoolapp.core.model.schools.SchoolDeletionStatus
import com.schoolapp.core.model.schools.SchoolPage
import com.schoolapp.core.model.schools.SchoolSetupInput
import com.schoolapp.core.model.schools.SchoolSetupResult
import com.schoolapp.core.model.schools.SchoolUpdate
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.schools.DeleteSchoolBody
import com.schoolapp.core.network.schools.SchoolsApi
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DefaultSchoolsRepository @Inject constructor(
    private val api: SchoolsApi,
    private val apiCaller: ApiCaller,
) : SchoolsRepository {

    private val _changes = MutableStateFlow(0)
    override val changes: StateFlow<Int> = _changes.asStateFlow()

    override suspend fun schools(search: String?, status: String?, page: Int, pageSize: Int): AppResult<SchoolPage> =
        apiCaller.call {
            val response = api.schools(search?.trim()?.takeIf { it.isNotEmpty() }, status, page, pageSize)
            SchoolPage(response.data.map { it.toModel() }, response.meta?.total, page, pageSize)
        }

    override suspend fun school(id: String): AppResult<School> = apiCaller.call { api.school(id).data.toModel() }

    override suspend fun update(id: String, update: SchoolUpdate): AppResult<School> =
        apiCaller.call { api.update(id, update.toBody()).data.toModel() }.changed()

    override suspend fun archive(id: String): AppResult<School> = apiCaller.call { api.archive(id).data.toModel() }.changed()

    override suspend fun activate(id: String): AppResult<School> = apiCaller.call { api.activate(id).data.toModel() }.changed()

    override suspend fun setup(input: SchoolSetupInput): AppResult<SchoolSetupResult> =
        apiCaller.call { api.setup(input.toBody()).data.toModel() }.changed()

    override suspend fun deletionPreview(id: String): AppResult<SchoolDeletionPreview> =
        apiCaller.call { api.deletionPreview(id).data.toModel() }

    override suspend fun requestDeletion(id: String, confirmCode: String): AppResult<SchoolDeletionStatus> =
        apiCaller.call { api.delete(id, DeleteSchoolBody(confirmCode)).data.toModel() }

    override suspend fun deletionStatus(id: String): AppResult<SchoolDeletionStatus> =
        apiCaller.call { api.deletionStatus(id).data.toModel() }

    override fun notifyChanged() = _changes.update { it + 1 }

    private fun <T> AppResult<T>.changed(): AppResult<T> = onSuccess { notifyChanged() }
}
