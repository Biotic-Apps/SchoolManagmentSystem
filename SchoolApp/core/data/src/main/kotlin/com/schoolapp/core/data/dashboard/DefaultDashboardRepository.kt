package com.schoolapp.core.data.dashboard

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.dashboard.DashboardMetric
import com.schoolapp.core.model.dashboard.ParentOverview
import com.schoolapp.core.model.dashboard.TeacherToday
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.DashboardApi
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.longOrNull
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DefaultDashboardRepository @Inject constructor(
    private val api: DashboardApi,
    private val apiCaller: ApiCaller,
) : DashboardRepository {

    override suspend fun summary(branchId: String?): AppResult<List<DashboardMetric>> =
        apiCaller.call { api.summary(branchId = branchId).data.toMetrics() }

    override suspend fun pending(branchId: String?, date: String): AppResult<List<DashboardMetric>> =
        apiCaller.call { api.pending(branchId, date).data.toMetrics() }

    override suspend fun teacherToday(): AppResult<TeacherToday> =
        apiCaller.call { api.teacherToday().data.toModel() }

    override suspend fun parentHome(studentId: String): AppResult<ParentOverview> =
        apiCaller.call { api.parentHome(studentId).data.toModel() }
}

/** Keeps numeric entries only, in server order; unknown future keys pass through. */
internal fun JsonObject.toMetrics(): List<DashboardMetric> = mapNotNull { (key, value) ->
    (value as? JsonPrimitive)?.longOrNull?.let { DashboardMetric(key, it) }
}
