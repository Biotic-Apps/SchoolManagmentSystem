package com.schoolapp.feature.complaints

import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.common.PersonRef
import com.schoolapp.core.model.complaint.ComplaintBox
import com.schoolapp.core.model.complaint.ComplaintStatus
import com.schoolapp.core.testing.TestSessions
import com.schoolapp.feature.complaints.detail.ComplainantDisplay
import com.schoolapp.feature.complaints.detail.toDetailUi
import com.schoolapp.feature.complaints.list.complaintTabs
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class ComplaintMappingTest {

    @Test
    fun hidden_complainant_shows_anonymous() {
        val detail = complaint(complainant = null).toDetailUi(viewerUserId = "u2", openedAsComplainant = false)
        assertEquals(ComplainantDisplay.Anonymous, detail.complainant)
        assertTrue(detail.isAssignee)
        assertTrue(detail.canAddUpdate)
        assertTrue(detail.canEscalate)
        assertFalse(detail.canComment)
    }

    @Test
    fun named_complainant_and_resolved_actions() {
        val detail = complaint(status = ComplaintStatus.RESOLVED).toDetailUi(viewerUserId = "u9", openedAsComplainant = false)
        assertEquals(ComplainantDisplay.Named("Hina", "PARENT"), detail.complainant)
        assertTrue(detail.canClose)
        assertTrue(detail.canReopen)
        assertTrue(detail.canComment)
        assertFalse(detail.canAddUpdate)
    }

    @Test
    fun anonymous_filer_opening_from_my_complaints_keeps_complainant_actions() {
        val detail = complaint(status = ComplaintStatus.RESOLVED, complainant = null)
            .toDetailUi(viewerUserId = "u9", openedAsComplainant = true)
        assertEquals(ComplainantDisplay.Anonymous, detail.complainant)
        assertTrue(detail.canReopen)
        assertFalse(complaint(status = ComplaintStatus.IN_PROGRESS, assignee = PersonRef("u3", "X"))
            .toDetailUi("u5", false).hasActions)
    }

    @Test
    fun tab_visibility_per_role() {
        assertEquals(listOf(ComplaintBox.MINE), complaintTabs(TestSessions.session(RoleKey.PARENT, "complaints.view")))
        assertEquals(
            listOf(ComplaintBox.MINE, ComplaintBox.ASSIGNED),
            complaintTabs(TestSessions.session(RoleKey.TEACHER, "complaints.view")),
        )
        assertEquals(
            listOf(ComplaintBox.MINE, ComplaintBox.ASSIGNED, ComplaintBox.ALL),
            complaintTabs(TestSessions.session(RoleKey.PRINCIPAL, "complaints.view")),
        )
        assertEquals(
            listOf(ComplaintBox.MINE, ComplaintBox.ASSIGNED),
            complaintTabs(TestSessions.session(RoleKey.PRINCIPAL)),
        )
    }
}
