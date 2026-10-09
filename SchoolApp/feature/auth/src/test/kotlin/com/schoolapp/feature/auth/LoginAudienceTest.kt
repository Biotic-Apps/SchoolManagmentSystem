package com.schoolapp.feature.auth

import com.schoolapp.feature.auth.components.LoginAudience
import org.junit.Assert.assertEquals
import org.junit.Test

class LoginAudienceTest {

    @Test
    fun staff_uses_email_phone_or_username_and_parent_asks_for_the_child_admission_number() {
        assertEquals(listOf(LoginAudience.STAFF, LoginAudience.PARENT), LoginAudience.entries)
        assertEquals(R.string.auth_identifier_label_staff, LoginAudience.STAFF.identifierLabelRes)
        assertEquals(R.string.auth_identifier_label_parent, LoginAudience.PARENT.identifierLabelRes)
    }
}
