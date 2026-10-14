package com.schoolapp.feature.organisation

import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.organisation.AcademicSession
import com.schoolapp.core.testing.MainDispatcherRule
import com.schoolapp.core.testing.TestSessions
import com.schoolapp.feature.organisation.branches.edit.BranchField
import com.schoolapp.feature.organisation.branches.edit.BranchForm
import com.schoolapp.feature.organisation.branches.edit.BranchFormRules
import com.schoolapp.feature.organisation.branches.edit.branchPermissions
import com.schoolapp.feature.organisation.scope.BranchOptionsLoader
import com.schoolapp.feature.organisation.sessions.edit.RangeField
import com.schoolapp.feature.organisation.sessions.terms.TermsEditor
import kotlinx.coroutines.test.TestScope
import kotlinx.coroutines.test.UnconfinedTestDispatcher
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

class OrganisationEditingTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    @Test
    fun principal_edits_only_timings_and_settings() {
        val perms = TestSessions.session(RoleKey.PRINCIPAL, "branches.view", "branches.edit").branchPermissions()
        assertTrue(perms.canEditTimings)
        assertFalse(perms.canEdit)
        assertTrue(perms.canEditSettings)
        assertFalse(perms.canChangePrincipal)
        val admin = TestSessions.session(RoleKey.SUPER_ADMIN, "branches.add", "branches.edit", "branches.delete", "users.edit").branchPermissions()
        assertTrue(admin.canAdd && admin.canEdit && admin.canArchive && admin.canChangePrincipal)
        assertFalse(admin.canEditTimings)
    }

    @Test
    fun timing_rules_match_the_web() {
        val bad = BranchForm(timingsOnly = true, opensAt = "08:00", closesAt = "07:00", attendanceLockAt = "09:00", staffArrivesAt = "08:30", staffLeavesAt = "06:00", workingDays = emptySet())
        val errors = BranchFormRules.validate(bad)
        assertEquals(setOf(BranchField.CLOSES, BranchField.LOCK, BranchField.STAFF_ARRIVE, BranchField.STAFF_LEAVE, BranchField.DAYS), errors.keys)
        assertTrue(BranchFormRules.validate(BranchForm(timingsOnly = true)).isEmpty())
        assertEquals("07:30", BranchFormRules.staffArrivalFor("08:00"))
        assertEquals("00:00", BranchFormRules.staffArrivalFor("00:10"))
    }

    @Test
    fun new_branch_needs_school_code_and_name() {
        val errors = BranchFormRules.validate(BranchForm(code = "a", name = "x", email = "nope"))
        assertTrue(errors.keys.containsAll(listOf(BranchField.SCHOOL, BranchField.CODE, BranchField.NAME, BranchField.EMAIL)))
    }

    @Test
    fun session_form_saves_and_reloads() {
        val edit = RecordingEditRepository()
        val repository = FakeOrganisationRepository()
        val auth = com.schoolapp.core.testing.FakeAuthRepository(TestSessions.session(RoleKey.PRINCIPAL, "branches.view", "sessions.add", "sessions.edit"))
        val vm = sessionsViewModel(BranchOptionsLoader(auth, repository), repository, edit.repository, auth)
        assertTrue(vm.uiState.value.canAddSession)
        vm.sessionEditor.openNew()
        vm.sessionEditor.saveForm()
        assertEquals(setOf(RangeField.NAME, RangeField.START, RangeField.END), vm.sessionEditor.state.value.form?.errors?.keys)
        vm.sessionEditor.editForm(RangeField.NAME) { it.copy(name = "2027-28", startDate = "2027-04-01", endDate = "2028-03-31") }
        vm.sessionEditor.saveForm()
        assertNull(vm.sessionEditor.state.value.form)
        assertTrue("saveSession" in edit.calls)
        assertEquals(R.string.org_session_created, vm.sessionEditor.state.value.notice)
    }

    @Test
    fun overlapping_term_is_rejected_before_saving() {
        val edit = RecordingEditRepository()
        val editor = TermsEditor(edit.repository)
        editor.attach(TestScope(UnconfinedTestDispatcher()), {})
        editor.open(AcademicSession("se1", "b1", "2026-27", "2026-04-01", "2027-03-31", "ACTIVE", 0), canEdit = true)
        editor.openForm(null)
        editor.editForm(RangeField.NAME) { it.copy(name = "Term 1", startDate = "2026-03-01", endDate = "2026-08-31") }
        editor.saveForm()
        assertEquals(R.string.org_term_outside_session, editor.state.value?.form?.errors?.get(RangeField.START))
        assertFalse("saveTerm" in edit.calls)
    }
}
