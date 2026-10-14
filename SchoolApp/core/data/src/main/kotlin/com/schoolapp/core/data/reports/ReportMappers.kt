package com.schoolapp.core.data.reports

import com.schoolapp.core.model.reports.Report
import com.schoolapp.core.model.reports.ReportArea
import com.schoolapp.core.model.reports.ReportFormat
import com.schoolapp.core.model.reports.ReportJobState
import com.schoolapp.core.model.reports.ReportJobStatus
import com.schoolapp.core.model.reports.ReportParam
import com.schoolapp.core.model.reports.ReportParamType
import com.schoolapp.core.model.reports.ReportRequest
import com.schoolapp.core.network.dto.reports.CreateReportBodyDto
import com.schoolapp.core.network.dto.reports.ReportCatalogEntryDto
import com.schoolapp.core.network.dto.reports.ReportParamDto
import com.schoolapp.core.network.dto.reports.ReportStatusDto
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive

private val AREA_BY_PREFIX = mapOf(
    "attendance" to ReportArea.ATTENDANCE,
    "results" to ReportArea.ACADEMICS,
    "exams" to ReportArea.ACADEMICS,
    "fees" to ReportArea.FEES,
    "payroll" to ReportArea.PAYROLL,
    "expenses" to ReportArea.EXPENSES,
    "profit-loss" to ReportArea.EXPENSES,
    "inventory" to ReportArea.INVENTORY,
    "branch" to ReportArea.BRANCHES,
    "branches" to ReportArea.BRANCHES,
)

private val AREA_BY_NAME = mapOf(
    "attendance" to ReportArea.ATTENDANCE,
    "academics" to ReportArea.ACADEMICS,
    "fees" to ReportArea.FEES,
    "payroll" to ReportArea.PAYROLL,
    "expenses" to ReportArea.EXPENSES,
    "inventory" to ReportArea.INVENTORY,
    "branches" to ReportArea.BRANCHES,
)

internal fun ReportCatalogEntryDto.toModel(): Report? {
    if (key.isBlank()) return null
    val given = (area ?: group ?: category)?.lowercase()
    val formats = formats.mapNotNull { name -> ReportFormat.entries.firstOrNull { it.name.equals(name, ignoreCase = true) } }
    return Report(
        key = key,
        title = title ?: name ?: key.replace('.', ' ').replace('-', ' ').replaceFirstChar { it.uppercase() },
        description = description?.takeIf { it.isNotBlank() },
        area = given?.let(AREA_BY_NAME::get) ?: AREA_BY_PREFIX[key.substringBefore('.')] ?: ReportArea.OTHER,
        params = params.mapNotNull { it.toModel() },
        formats = formats.ifEmpty { ReportFormat.entries.toList() },
    )
}

private fun ReportParamDto.toModel(): ReportParam? {
    val paramName = (name ?: key)?.takeIf { it.isNotBlank() } ?: return null
    return ReportParam(paramName, paramType(paramName, type?.lowercase()), required, label?.takeIf { it.isNotBlank() })
}

/** The API sends `uuid | month | date | int`; ids are told apart by name. Web-style type names are accepted too. */
internal fun paramType(name: String, type: String?): ReportParamType = when (type) {
    "month" -> ReportParamType.MONTH
    "date" -> ReportParamType.DATE
    "int", "number" -> ReportParamType.NUMBER
    "branch" -> ReportParamType.BRANCH
    "school" -> ReportParamType.SCHOOL
    "exam" -> ReportParamType.EXAM
    else -> when (name) {
        "branchId" -> ReportParamType.BRANCH
        "schoolId" -> ReportParamType.SCHOOL
        "examId" -> ReportParamType.EXAM
        else -> ReportParamType.TEXT
    }
}

internal fun ReportStatusDto.toModel(): ReportJobStatus {
    val state = when (status?.uppercase()) {
        "DONE", "READY", "COMPLETED" -> ReportJobState.DONE
        "FAILED" -> ReportJobState.FAILED
        "RUNNING", "PROCESSING" -> ReportJobState.RUNNING
        else -> ReportJobState.QUEUED
    }
    return ReportJobStatus(state, fileUrl?.takeIf { it.isNotBlank() }, count, error?.takeIf { it.isNotBlank() })
}

/** Blank values are left out; NUMBER params go out as JSON integers. */
internal fun ReportRequest.toBody(): CreateReportBodyDto {
    val values = params
        .mapValues { it.value.trim() }
        .filterValues { it.isNotEmpty() }
        .mapValues { (name, value) ->
            if (name in numberParams) JsonPrimitive(value.toLongOrNull() ?: 0L) else JsonPrimitive(value)
        }
    return CreateReportBodyDto(key, JsonObject(values), format.name)
}
