package com.schoolapp.core.network.dto.reports

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject

/** Catalog entry; the contract leaves room for `name`/`area` aliases, so most fields are optional. */
@Serializable
data class ReportCatalogEntryDto(
    val key: String = "",
    val title: String? = null,
    val name: String? = null,
    val description: String? = null,
    val area: String? = null,
    val group: String? = null,
    val category: String? = null,
    val formats: List<String> = emptyList(),
    val params: List<ReportParamDto> = emptyList(),
)

@Serializable
data class ReportParamDto(
    val name: String? = null,
    val key: String? = null,
    val type: String? = null,
    val label: String? = null,
    val required: Boolean = false,
    /** Not sent today; kept as raw JSON so a future shape does not break decoding. */
    val options: JsonElement? = null,
)

@Serializable
data class CreateReportBodyDto(
    val key: String,
    val params: JsonObject,
    val format: String,
)

@Serializable
data class ReportJobDto(
    val jobId: String? = null,
    val id: String? = null,
)

@Serializable
data class ReportStatusDto(
    val status: String? = null,
    val fileUrl: String? = null,
    val count: Int? = null,
    val error: String? = null,
)
