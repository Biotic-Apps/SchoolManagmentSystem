package com.schoolapp.feature.activities

import androidx.lifecycle.SavedStateHandle
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.organisation.OrganisationRepository
import com.schoolapp.core.data.organisation.ScopedSections
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.testing.FakeAuthRepository
import com.schoolapp.core.testing.MainDispatcherRule
import com.schoolapp.core.testing.TestSessions
import com.schoolapp.feature.activities.propose.ProposeActivityViewModel
import com.schoolapp.feature.activities.propose.ProposeField
import com.schoolapp.feature.activities.propose.ProposeForm
import com.schoolapp.feature.activities.propose.ProposeValidation
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import java.lang.reflect.Proxy
import java.time.LocalDateTime

class ProposeActivityTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val today = "2026-10-06"
    private val valid = ProposeForm(
        title = "Zoo trip",
        description = "Class 5 visit",
        date = "2026-10-20",
        startTime = "09:00",
        endTime = "13:00",
    )

    @Test
    fun valid_form_has_no_errors() {
        assertTrue(ProposeValidation.validate(valid, today).isEmpty())
    }

    @Test
    fun end_must_be_after_start() {
        assertTrue(ProposeField.END_BEFORE_START in ProposeValidation.validate(valid.copy(endTime = "09:00"), today))
        assertTrue(ProposeField.END_BEFORE_START in ProposeValidation.validate(valid.copy(endTime = "08:30"), today))
        assertFalse(ProposeField.END_BEFORE_START in ProposeValidation.validate(valid.copy(endTime = "09:01"), today))
    }

    @Test
    fun consent_deadline_must_be_on_or_before_start_date() {
        val consent = valid.copy(consentRequired = true)
        assertTrue(ProposeField.DEADLINE in ProposeValidation.validate(consent, today))
        assertTrue(ProposeValidation.validate(consent.copy(consentDeadline = "2026-10-20"), today).isEmpty())
        assertTrue(ProposeField.DEADLINE_AFTER_START in ProposeValidation.validate(consent.copy(consentDeadline = "2026-10-25"), today))
        assertTrue(ProposeValidation.validate(consent.copy(consentDeadline = "2026-10-19"), today).isEmpty())
    }

    @Test
    fun required_fields_sections_and_past_date() {
        val errors = ProposeValidation.validate(ProposeForm(wholeBranch = false), today)
        assertTrue(errors.containsAll(listOf(ProposeField.TITLE, ProposeField.DESCRIPTION, ProposeField.DATE, ProposeField.START_TIME, ProposeField.END_TIME, ProposeField.SECTIONS)))
        assertTrue(ProposeField.DATE_PAST in ProposeValidation.validate(valid.copy(date = "2026-10-05"), today))
    }

    @Test
    fun submit_sends_local_date_times_and_reports_success() {
        val repository = FakeActivitiesRepository()
        val auth = FakeAuthRepository(TestSessions.session(RoleKey.TEACHER, "activities.add"))
        val organisation = noOrganisation()
        val vm = ProposeActivityViewModel(SavedStateHandle(), repository, ScopedSections(auth, organisation), organisation, auth, AppClock { LocalDateTime.of(2026, 10, 6, 9, 0) })
        vm.submit()
        assertFalse(vm.uiState.value.errors.isEmpty())
        assertTrue(repository.proposals.isEmpty())

        vm.onTitleChange("Zoo trip")
        vm.onDescriptionChange("Visit")
        vm.onDateChange("2026-10-20")
        vm.onStartTimeChange("09:00")
        vm.onEndTimeChange("13:00")
        vm.onConsentRequiredChange(true)
        vm.onDeadlineChange("2026-10-15")
        vm.submit()

        assertTrue(vm.uiState.value.submitted)
        val input = repository.proposals.single()
        assertEquals("2026-10-20T09:00", input.startAt)
        assertEquals("2026-10-20T13:00", input.endAt)
        assertEquals("2026-10-15", input.consentDeadline)
        assertEquals("b1", input.branchId)
        assertTrue(input.wholeBranch)
    }

    /** Organisation calls are irrelevant here; every call fails with an empty result. */
    private fun noOrganisation(): OrganisationRepository = Proxy.newProxyInstance(
        OrganisationRepository::class.java.classLoader,
        arrayOf(OrganisationRepository::class.java),
    ) { _, _, _ -> AppResult.Success(emptyList<Any>()) } as OrganisationRepository
}
