package com.schoolapp.feature.activities

import com.schoolapp.core.model.activity.ConsentStatus
import com.schoolapp.feature.activities.domain.ConsentRules
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test
import java.time.LocalDateTime
import java.time.ZoneId

class ConsentRulesTest {

    private val karachi = ZoneId.of("Asia/Karachi")

    @Test
    fun date_only_deadline_is_open_through_the_end_of_that_day() {
        assertTrue(ConsentRules.canRespond("2026-10-10", LocalDateTime.of(2026, 10, 9, 12, 0), karachi))
        assertTrue(ConsentRules.canRespond("2026-10-10", LocalDateTime.of(2026, 10, 10, 0, 0), karachi))
        assertTrue(ConsentRules.canRespond("2026-10-10", LocalDateTime.of(2026, 10, 10, 23, 59, 59), karachi))
        assertFalse(ConsentRules.canRespond("2026-10-10", LocalDateTime.of(2026, 10, 11, 0, 0), karachi))
    }

    @Test
    fun timestamp_deadline_closes_at_that_instant() {
        // 2026-10-10T07:00Z is 12:00 in Karachi (UTC+5).
        val deadline = "2026-10-10T07:00:00.000Z"
        assertTrue(ConsentRules.canRespond(deadline, LocalDateTime.of(2026, 10, 10, 11, 59), karachi))
        assertTrue(ConsentRules.canRespond(deadline, LocalDateTime.of(2026, 10, 10, 12, 0), karachi))
        assertFalse(ConsentRules.canRespond(deadline, LocalDateTime.of(2026, 10, 10, 12, 1), karachi))
    }

    @Test
    fun local_date_time_and_missing_deadlines() {
        assertTrue(ConsentRules.canRespond("2026-10-10T09:00", LocalDateTime.of(2026, 10, 10, 9, 0), karachi))
        assertFalse(ConsentRules.canRespond("2026-10-10T09:00", LocalDateTime.of(2026, 10, 10, 9, 1), karachi))
        assertTrue(ConsentRules.canRespond(null, LocalDateTime.of(2030, 1, 1, 0, 0), karachi))
    }

    @Test
    fun needs_response_only_for_pending_before_deadline() {
        val now = LocalDateTime.of(2026, 10, 9, 10, 0)
        assertTrue(ConsentRules.needsResponse(activity(), now, karachi))
        assertFalse(ConsentRules.needsResponse(activity(myConsent = ConsentStatus.GRANTED), now, karachi))
        assertFalse(ConsentRules.needsResponse(activity(), LocalDateTime.of(2026, 10, 11, 10, 0), karachi))
    }
}
