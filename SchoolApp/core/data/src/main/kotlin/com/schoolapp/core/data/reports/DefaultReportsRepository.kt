package com.schoolapp.core.data.reports

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.reports.Report
import com.schoolapp.core.model.reports.ReportJobStatus
import com.schoolapp.core.model.reports.ReportRequest
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.reports.ReportsApi
import javax.inject.Inject
import javax.inject.Singleton

/** Network calls run on the IO dispatcher through [ApiCaller]. */
@Singleton
class DefaultReportsRepository @Inject constructor(
    private val api: ReportsApi,
    private val apiCaller: ApiCaller,
) : ReportsRepository {

    override suspend fun catalog(): AppResult<List<Report>> =
        apiCaller.call { api.catalog().data.mapNotNull { it.toModel() } }

    override suspend fun generate(request: ReportRequest): AppResult<String> =
        when (val result = apiCaller.call { api.create(request.toBody()).data }) {
            is AppResult.Failure -> result
            is AppResult.Success -> (result.data.jobId ?: result.data.id)?.let { AppResult.Success(it) }
                ?: AppResult.Failure(AppError.Server(HTTP_SERVER_ERROR, null, null))
        }

    override suspend fun status(jobId: String): AppResult<ReportJobStatus> =
        apiCaller.call { api.status(jobId).data.toModel() }

    private companion object {
        const val HTTP_SERVER_ERROR = 500
    }
}
