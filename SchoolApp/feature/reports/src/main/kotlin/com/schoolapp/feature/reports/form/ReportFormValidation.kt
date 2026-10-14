package com.schoolapp.feature.reports.form

import com.schoolapp.core.model.reports.Report
import com.schoolapp.core.model.reports.ReportFormat
import com.schoolapp.core.model.reports.ReportParamType
import com.schoolapp.core.model.reports.ReportRequest
import java.time.LocalDate
import java.time.YearMonth

private val DATE = Regex("""^\d{4}-\d{2}-\d{2}$""")
private val MONTH = Regex("""^\d{4}-\d{2}$""")
private val DIGITS = Regex("""^\d+$""")

/** Same rules as the web form: required fields, date / month / whole-number shapes, and from <= to. */
internal fun validate(report: Report, values: Map<String, String>): Map<String, FieldError> {
    val errors = mutableMapOf<String, FieldError>()
    for (param in report.params) {
        val value = values[param.name].orEmpty().trim()
        val error = when {
            value.isEmpty() -> if (param.required) FieldError.REQUIRED else null
            param.type == ReportParamType.DATE && !DATE.matches(value) -> FieldError.BAD_DATE
            param.type == ReportParamType.MONTH && !MONTH.matches(value) -> FieldError.BAD_MONTH
            param.type == ReportParamType.NUMBER && !DIGITS.matches(value) -> FieldError.BAD_NUMBER
            else -> null
        }
        error?.let { errors[param.name] = it }
    }
    val from = values[FROM].orEmpty()
    val to = values[TO].orEmpty()
    if (FROM !in errors && TO !in errors && from.isNotEmpty() && to.isNotEmpty() && from > to) {
        errors[TO] = FieldError.END_BEFORE_START
    }
    return errors
}

/** Starting values: the session branch, this month, and the first of the month to today. */
internal fun defaultValues(report: Report, branchId: String?, today: LocalDate): Map<String, String> =
    report.params.associate { param ->
        param.name to when {
            param.type == ReportParamType.BRANCH -> branchId.orEmpty()
            param.type == ReportParamType.MONTH -> YearMonth.from(today).toString()
            param.name == FROM -> today.withDayOfMonth(1).toString()
            param.name == TO -> today.toString()
            else -> ""
        }
    }

internal fun toRequest(report: Report, values: Map<String, String>, format: ReportFormat): ReportRequest = ReportRequest(
    key = report.key,
    params = report.params.associate { it.name to values[it.name].orEmpty().trim() }.filterValues { it.isNotEmpty() },
    format = format,
    numberParams = report.params.filter { it.type == ReportParamType.NUMBER }.map { it.name }.toSet(),
)

internal const val FROM = "from"
internal const val TO = "to"
