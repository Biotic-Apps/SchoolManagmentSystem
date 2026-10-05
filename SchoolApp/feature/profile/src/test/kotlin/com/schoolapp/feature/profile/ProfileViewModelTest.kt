package com.schoolapp.feature.profile

import app.cash.turbine.test
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.profile.ProfileUpdate
import com.schoolapp.core.testing.FakeAuthRepository
import com.schoolapp.core.testing.MainDispatcherRule
import com.schoolapp.core.testing.TestSessions
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

class ProfileViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val auth = FakeAuthRepository(TestSessions.session(RoleKey.PRINCIPAL, "profile.view"))
    private val profile = FakeProfileRepository()
    private val viewModel by lazy { ProfileViewModel(auth, profile) }

    @Test
    fun loads_current_user_into_form() {
        val state = viewModel.uiState.value
        assertFalse(state.isLoading)
        assertEquals("Sara Ali", state.form.name)
        assertEquals("sara@school.pk", state.form.email)
        assertFalse(state.hasChanges)
        assertEquals(RoleKey.PRINCIPAL, state.roles.single().role)
    }

    @Test
    fun blank_name_is_rejected_without_calling_server() {
        viewModel.onNameChange("  ")
        viewModel.onSave()
        assertEquals(ProfileFieldError.REQUIRED, viewModel.uiState.value.nameError)
        assertTrue(profile.updates.isEmpty())
    }

    @Test
    fun invalid_email_and_phone_are_rejected() {
        viewModel.onEmailChange("sara@school")
        viewModel.onPhoneChange("12ab")
        viewModel.onSave()
        val state = viewModel.uiState.value
        assertEquals(ProfileFieldError.INVALID_EMAIL, state.emailError)
        assertEquals(ProfileFieldError.INVALID_PHONE, state.phoneError)
        assertTrue(profile.updates.isEmpty())
    }

    @Test
    fun removing_both_contacts_is_rejected() {
        viewModel.onEmailChange("")
        viewModel.onPhoneChange("")
        viewModel.onSave()
        assertEquals(ProfileFieldError.CONTACT_REQUIRED, viewModel.uiState.value.emailError)
    }

    @Test
    fun editing_clears_the_field_error() {
        viewModel.onNameChange("")
        viewModel.onSave()
        viewModel.onNameChange("Sara A")
        assertNull(viewModel.uiState.value.nameError)
    }

    @Test
    fun save_sends_only_changed_trimmed_fields() = runTest {
        viewModel.uiState.test {
            awaitItem()
            viewModel.onNameChange("  Sara Ahmed ")
            awaitItem()
            viewModel.onSave()
            val saved = expectMostRecentItem()
            assertTrue(saved.saved)
            assertFalse(saved.hasChanges)
            assertEquals("Sara Ahmed", saved.original.name)
        }
        assertEquals(listOf(ProfileUpdate(name = "Sara Ahmed")), profile.updates)
    }

    @Test
    fun server_conflict_is_shown_and_edits_kept() {
        profile.nextError = AppError.Server(409, "CONFLICT", "Email already in use")
        viewModel.onEmailChange("taken@school.pk")
        viewModel.onSave()
        val state = viewModel.uiState.value
        assertEquals(AppError.Server(409, "CONFLICT", "Email already in use"), state.saveError)
        assertEquals("taken@school.pk", state.form.email)
        assertTrue(state.hasChanges)
    }
}
