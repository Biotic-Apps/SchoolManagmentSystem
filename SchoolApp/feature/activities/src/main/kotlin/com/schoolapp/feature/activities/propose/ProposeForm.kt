package com.schoolapp.feature.activities.propose

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.time.TimeFormat
import com.schoolapp.core.model.activity.ActivityType
import java.time.LocalDate
import java.time.format.DateTimeParseException

enum class ProposeField { TITLE, DESCRIPTION, DATE, DATE_PAST, START_TIME, END_TIME, END_BEFORE_START, SECTIONS, DEADLINE, DEADLINE_AFTER_START }

/** Teacher proposal being edited; [date] `YYYY-MM-DD`, times API `HH:mm` (shown 12-hour). */
@Immutable
data class ProposeForm(
    val type: ActivityType = ActivityType.EVENT,
    val title: String = "",
    val description: String = "",
    val date: String? = null,
    val startTime: String? = null,
    val endTime: String? = null,
    val venue: String = "",
    val wholeBranch: Boolean = true,
    val sectionIds: Set<String> = emptySet(),
    val consentRequired: Boolean = false,
    val consentDeadline: String? = null,
)

/** Pure checks: end after start on the same day, consent deadline strictly before the start date. */
object ProposeValidation {
    fun validate(form: ProposeForm, today: String): Set<ProposeField> = buildSet {
        if (form.title.isBlank()) add(ProposeField.TITLE)
        if (form.description.isBlank()) add(ProposeField.DESCRIPTION)
        val date = form.date?.let(::parseDate)
        when {
            date == null -> add(ProposeField.DATE)
            parseDate(today)?.let { date.isBefore(it) } == true -> add(ProposeField.DATE_PAST)
        }
        val start = form.startTime?.let(TimeFormat::parseTime)
        val end = form.endTime?.let(TimeFormat::parseTime)
        if (start == null) add(ProposeField.START_TIME)
        if (end == null) add(ProposeField.END_TIME)
        if (start != null && end != null && !end.isAfter(start)) add(ProposeField.END_BEFORE_START)
        if (!form.wholeBranch && form.sectionIds.isEmpty()) add(ProposeField.SECTIONS)
        if (form.consentRequired) {
            val deadline = form.consentDeadline?.let(::parseDate)
            when {
                deadline == null -> add(ProposeField.DEADLINE)
                date != null && !deadline.isBefore(date) -> add(ProposeField.DEADLINE_AFTER_START)
            }
        }
    }

    private fun parseDate(value: String): LocalDate? = try {
        LocalDate.parse(value)
    } catch (e: DateTimeParseException) {
        null
    }
}
