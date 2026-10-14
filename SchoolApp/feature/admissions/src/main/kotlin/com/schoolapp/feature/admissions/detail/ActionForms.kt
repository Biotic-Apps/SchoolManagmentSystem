package com.schoolapp.feature.admissions.detail

import com.schoolapp.core.model.admissions.AdmissionTest
import java.time.Instant
import java.time.LocalDate
import java.time.LocalTime
import java.time.ZoneId
import java.time.ZonedDateTime
import java.time.format.DateTimeParseException
import java.util.Locale

/** Problems of the small action forms; null means the field is fine. */
enum class ActionProblem { REQUIRED, NOT_A_NUMBER, MAX_NOT_POSITIVE, SCORE_ABOVE_MAX, TOO_SHORT }

internal object ActionForms {
    private val DECIMAL = Regex("""^\d+(\.\d{1,2})?$""")
    const val REASON_MIN = 3

    /** Test date (`YYYY-MM-DD`) and time (`HH:mm`) in the school's wall-clock time as an ISO instant. */
    fun scheduledAt(date: String, time: String, zone: ZoneId = ZoneId.systemDefault()): String? = try {
        ZonedDateTime.of(LocalDate.parse(date), LocalTime.parse(time), zone).toInstant().toString()
    } catch (e: DateTimeParseException) {
        null
    }

    /** Date and `HH:mm` of an existing test, for rescheduling. */
    fun splitSchedule(test: AdmissionTest?, zone: ZoneId = ZoneId.systemDefault()): Pair<String, String> {
        val at = test?.scheduledAt?.let { runCatching { Instant.parse(it).atZone(zone) }.getOrNull() } ?: return "" to DEFAULT_TIME
        return at.toLocalDate().toString() to String.format(Locale.ROOT, "%02d:%02d", at.hour, at.minute)
    }

    fun scoreProblems(score: String, maxScore: String): Map<String, ActionProblem> = buildMap {
        val s = score.trim()
        val m = maxScore.trim()
        when {
            s.isEmpty() -> put(SCORE, ActionProblem.REQUIRED)
            !DECIMAL.matches(s) -> put(SCORE, ActionProblem.NOT_A_NUMBER)
        }
        when {
            m.isEmpty() -> put(MAX, ActionProblem.REQUIRED)
            !DECIMAL.matches(m) -> put(MAX, ActionProblem.NOT_A_NUMBER)
            m.toDouble() <= 0.0 -> put(MAX, ActionProblem.MAX_NOT_POSITIVE)
            DECIMAL.matches(s) && s.toDouble() > m.toDouble() -> put(SCORE, ActionProblem.SCORE_ABOVE_MAX)
        }
    }

    fun reasonProblem(reason: String, required: Boolean): ActionProblem? = when {
        !required -> null
        reason.isBlank() -> ActionProblem.REQUIRED
        reason.trim().length < REASON_MIN -> ActionProblem.TOO_SHORT
        else -> null
    }

    fun isDecimal(value: String) = DECIMAL.matches(value.trim())

    const val SCORE = "score"
    const val MAX = "maxScore"
    const val DEFAULT_TIME = "09:00"
}
