package com.schoolapp.core.network.api.reports

import com.schoolapp.core.network.dto.reports.CreateReportBodyDto
import com.schoolapp.core.network.dto.reports.ReportCatalogEntryDto
import com.schoolapp.core.network.dto.reports.ReportJobDto
import com.schoolapp.core.network.dto.reports.ReportStatusDto
import com.schoolapp.core.network.model.ApiEnvelope
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path

/** Reports & History: catalog, queue an export, poll its job. */
interface ReportsApi {
    @GET("reports/catalog")
    suspend fun catalog(): ApiEnvelope<List<ReportCatalogEntryDto>>

    @POST("reports")
    suspend fun create(@Body body: CreateReportBodyDto): ApiEnvelope<ReportJobDto>

    @GET("reports/{jobId}")
    suspend fun status(@Path("jobId") jobId: String): ApiEnvelope<ReportStatusDto>
}
