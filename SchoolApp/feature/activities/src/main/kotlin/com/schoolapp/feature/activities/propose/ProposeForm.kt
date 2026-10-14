package com.schoolapp.feature.activities.propose

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.time.TimeFormat
import com.schoolapp.core.model.activity.ActivityType
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.format.DateTimeParseException

enum class ProposeField {
    TITLE, DESCRIPTION, DATE, DATE_PAST, START_TIME, END_TIME, END_BEFORE_START, SECTIONS, DEADLINE, DEADLINE_AFTER_START, FEE, MAX_PARTICIPANTS,
}

/**
 * Proposal being edited; dates `YYYY-MM-DD`, times API `HH:mm` (shown 12-hour).
 * [endDate] null means the activity ends on [date]; [fee] is in rupees as typed.
 */
@Immutable
data class ProposeForm(
    val type: ActivityType = ActivityType.EVENT,
    val title: String = "",
    val description: String = "",
    val date: String? = null,
    val startTime: String? = null,
    val endDate: String? = null,
    val endTime: String? = null,
    val venue: String = "",
    val wholeBranch: Boolean = true,
    val classIds: Set<String> = emptySet(),
    val sectionIds: Set<String> = emptySet(),
    val consentRequired: Boolean = false,
    val consentDeadline: String? = null,
    val fee: String = "",
    val maxParticipants: String = "",
) {
    val effectiveEndDate: String? get() = endDate ?: date
}

/** Pure checks: end after start, audience chosen, consent deadline on or before the start date, numbers well formed. */
object ProposeValidation {
    /** [allowPast] when editing an existing proposal. */
    fun validate(form: ProposeForm, today: String, allowPast: Boolean = false): Set<ProposeField> = buildSet {
        if (form.title.isBlank()) add(ProposeField.TITLE)
        if (form.description.isBlank()) add(ProposeField.DESCRIPTION)
        val date = form.date?.let(::parseDate)
        when {
            date == null -> add(ProposeField.DATE)
            !allowPast && parseDate(today)?.let { date.isBefore(it) } == true -> add(ProposeField.DATE_PAST)
        }
        val start = form.startTime?.let(TimeFormat::parseTime)
        val end = form.endTime?.let(TimeFormat::parseTime)
        val endDate = form.effectiveEndDate?.let(::parseDate)
        if (start == null) add(ProposeField.START_TIME)
        if (end == null) add(ProposeField.END_TIME)
        if (date != null && start != null && endDate != null && end != null) {
            if (!LocalDateTime.of(endDate, end).isAfter(LocalDateTime.of(date, start))) add(ProposeField.END_BEFORE_START)
        }
        if (!form.wholeBranch && form.sectionIds.isEmpty() && form.classIds.isEmpty()) add(ProposeField.SECTIONS)
        if (form.consentRequired) {
            val deadline = form.consentDeadline?.let(::parseDate)
            when {
                deadline == null -> add(ProposeField.DEADLINE)
                date != null && deadline.isAfter(date) -> add(ProposeField.DEADLINE_AFTER_START)
            }
        }
        if (form.fee.isNotBlank() && feeMinor(form.fee) == null) add(ProposeField.FEE)
        if (form.maxParticipants.isNotBlank() && form.maxParticipants.trim().toIntOrNull()?.takeIf { it > 0 } == null) {
            add(ProposeField.MAX_PARTICIPANTS)
        }
    }

    /** "500" or "500.50" rupees -> paisa; null when malformed. */
    fun feeMinor(value: String): Long? {
        val text = value.trim()
        if (!FEE_PATTERN.matches(text)) return null
        return text.toBigDecimal().movePointRight(2).toLong()
    }

    private fun parseDate(value: String): LocalDate? = try {
        LocalDate.parse(value)
    } catch (e: DateTimeParseException) {
        null
    }

    private val FEE_PATTERN = Regex("""^\d+(\.\d{1,2})?$""")
}
