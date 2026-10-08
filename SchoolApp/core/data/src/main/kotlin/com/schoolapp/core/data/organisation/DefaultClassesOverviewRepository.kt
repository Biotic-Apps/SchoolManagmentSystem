package com.schoolapp.core.data.organisation

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.organisation.ClassOverview
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.OrganisationApi
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DefaultClassesOverviewRepository @Inject constructor(
    private val api: OrganisationApi,
    private val apiCaller: ApiCaller,
) : ClassesOverviewRepository {

    override suspend fun overview(branchId: String, schoolId: String?, sessionId: String?): AppResult<List<ClassOverview>> {
        val result = apiCaller.call {
            api.classesOverview(branchId, sessionId).data.map { it.toModel() }.sortedBy { it.levelOrder ?: Int.MAX_VALUE }
        }
        val error = (result as? AppResult.Failure)?.error
        if (error !is AppError.Server || error.httpCode != HTTP_NOT_FOUND) return result
        return apiCaller.call {
            coroutineScope {
                val classes = async { api.classes(schoolId).data }
                val sections = async { api.sections(branchId, sessionId).data }
                overviewFromLists(classes.await(), sections.await())
            }
        }
    }

    private companion object {
        const val HTTP_NOT_FOUND = 404
    }
}
