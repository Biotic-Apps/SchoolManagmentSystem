package com.schoolapp.core.model.reports

/** Export file types the server can render. */
enum class ReportFormat { PDF, XLSX, CSV }

/** What kind of input a report parameter needs; drives the picker shown in the form. */
enum class ReportParamType { BRANCH, SCHOOL, EXAM, MONTH, DATE, NUMBER, TEXT }

/** Section a report is listed under, in display order. */
enum class ReportArea { ATTENDANCE, ACADEMICS, FEES, PAYROLL, EXPENSES, INVENTORY, BRANCHES, OTHER }

data class ReportParam(
    val name: String,
    val type: ReportParamType,
    val required: Boolean,
    /** Label sent by the server, if any; the app falls back to its own wording. */
    val label: String? = null,
)

/** One entry of `GET /reports/catalog` (already filtered to what the caller may run). */
data class Report(
    val key: String,
    val title: String,
    val description: String?,
    val area: ReportArea,
    val params: List<ReportParam>,
    val formats: List<ReportFormat>,
)

/** Body of `POST /reports`: values are strings except NUMBER params, which are sent as integers. */
data class ReportRequest(
    val key: String,
    val params: Map<String, String>,
    val format: ReportFormat,
    val numberParams: Set<String> = emptySet(),
)
