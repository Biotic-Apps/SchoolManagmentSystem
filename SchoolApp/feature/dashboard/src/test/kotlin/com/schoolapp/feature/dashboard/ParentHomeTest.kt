package com.schoolapp.feature.dashboard

import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.fees.FeeSummary
import com.schoolapp.core.model.fees.NextDue
import com.schoolapp.core.model.timetable.TeacherSlot
import com.schoolapp.core.navigation.BookMeetingDestination
import com.schoolapp.core.navigation.InvoiceDetailDestination
import com.schoolapp.core.navigation.MenuIds
import com.schoolapp.core.navigation.NewThreadDestination
import com.schoolapp.feature.dashboard.parent.ParentActionKind
import com.schoolapp.feature.dashboard.parent.ParentHome
import com.schoolapp.feature.dashboard.parent.attendanceTone
import com.schoolapp.feature.dashboard.parent.eventKind
import com.schoolapp.feature.dashboard.parent.feeLink
import com.schoolapp.feature.dashboard.parent.parentActions
import com.schoolapp.feature.dashboard.parent.percentText
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test
import java.time.LocalDateTime

class ParentHomeTest {

    // Tuesday 6 Oct 2026, 8:45 AM.
    private val now = LocalDateTime.of(2026, 10, 6, 8, 45)

    private fun slot(index: Int, start: String, end: String, subject: String, teacher: String?) = TeacherSlot(
        date = "2026-10-06", day = 2, periodIndex = index, startTime = start, endTime = end, sectionName = "A",
        className = "Class 5", subjectName = subject, staffName = teacher, roomName = null, isSubstitute = false,
    )

    private fun fees(invoiceId: String?) = FeeSummary(
        totalDueMinor = 485_000, overdueMinor = 0, advanceMinor = 0, lastPayment = null,
        nextDue = NextDue(485_000, "2026-10-10", "INV-1", invoiceId), currency = "PKR",
    )

    @Test
    fun periods_name_the_teacher_and_mark_the_running_one() {
        val overview = parentOverview(
            periods = listOf(slot(2, "08:40", "09:20", "Maths", "Sara Ali"), slot(1, "08:00", "08:40", "English", null)),
        )
        val periods = ParentHome.from(overview, now).periods
        assertEquals(listOf("English", "Maths"), periods.map { it.title })
        assertEquals(listOf(null, "Sara Ali"), periods.map { it.subtitle })
        assertTrue(periods[0].isPast)
        assertTrue(periods[1].isCurrent)
    }

    @Test
    fun all_menus_give_every_action_and_pay_opens_the_next_invoice() {
        val actions = parentActions(fees("inv1")) { true }
        assertEquals(ParentActionKind.entries, actions.map { it.kind })
        assertEquals(DashboardLink.Screen(InvoiceDetailDestination("inv1")), actions.first().link)
        assertEquals(DashboardLink.Screen(NewThreadDestination), actions[1].link)
        assertEquals(DashboardLink.Screen(BookMeetingDestination), actions[3].link)
    }

    @Test
    fun actions_without_a_reachable_destination_are_hidden() {
        val onlyFees = setOf(MenuIds.FEES)
        val kinds = parentActions(fees(null)) { it in onlyFees }.map { it.kind }
        assertEquals(listOf(ParentActionKind.PAY_FEES, ParentActionKind.HEALTH, ParentActionKind.PICKUP), kinds)
        assertFalse(parentActions(null) { true }.any { it.kind == ParentActionKind.PAY_FEES })
    }

    @Test
    fun fee_link_falls_back_to_the_fees_menu_and_needs_fees_access() {
        assertEquals(DashboardLink.Menu(MenuIds.FEES), feeLink(fees(null)) { true })
        assertNull(feeLink(fees("inv1")) { false })
    }

    @Test
    fun attendance_percent_text_and_tone() {
        assertEquals("92%", percentText(92.0))
        assertEquals("85.7%", percentText(85.714))
        assertNull(percentText(null))
        assertEquals(StatusTone.Success, attendanceTone(95.0))
        assertEquals(StatusTone.Warning, attendanceTone(80.0))
        assertEquals(StatusTone.Error, attendanceTone(60.0))
        assertEquals(StatusTone.Neutral, attendanceTone(null))
    }

    @Test
    fun unknown_event_kinds_read_as_events() {
        assertEquals(R.string.dashboard_event_holiday, eventKind("HOLIDAY").labelRes)
        assertEquals(R.string.dashboard_event_event, eventKind("SOMETHING_NEW").labelRes)
    }
}
