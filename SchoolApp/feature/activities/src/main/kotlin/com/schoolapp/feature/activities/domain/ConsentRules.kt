package com.schoolapp.feature.activities.domain

import com.schoolapp.core.model.activity.Activity
import com.schoolapp.core.model.activity.ConsentStatus
import java.time.Instant
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.OffsetDateTime
import java.time.ZoneId
import java.time.format.DateTimeParseException

/** Parent consent window: a date-only deadline is open until the end of that day; a timestamp until that instant. */
object ConsentRules {

    fun canRespond(deadline: String?, now: LocalDateTime, zone: ZoneId = ZoneId.systemDefault()): Boolean {
        val value = deadline?.trim()?.takeIf { it.isNotEmpty() } ?: return true
        if (value.length == DATE_LENGTH) {
            return parse { LocalDate.parse(value) }?.let { !now.toLocalDate().isAfter(it) } ?: true
        }
        val nowInstant = now.atZone(zone).toInstant()
        val closesAt = parse { Instant.parse(value) }
            ?: parse { OffsetDateTime.parse(value).toInstant() }
            ?: parse { LocalDateTime.parse(value).atZone(zone).toInstant() }
            ?: return true
        return !nowInstant.isAfter(closesAt)
    }

    /** Parent list chip: the child's consent is still PENDING and the window is open. */
    fun needsResponse(activity: Activity, now: LocalDateTime, zone: ZoneId = ZoneId.systemDefault()): Boolean =
        activity.consentRequired && activity.myConsent == ConsentStatus.PENDING && canRespond(activity.consentDeadline, now, zone)

    private inline fun <T> parse(block: () -> T): T? = try {
        block()
    } catch (e: DateTimeParseException) {
        null
    }

    private const val DATE_LENGTH = 10
}
