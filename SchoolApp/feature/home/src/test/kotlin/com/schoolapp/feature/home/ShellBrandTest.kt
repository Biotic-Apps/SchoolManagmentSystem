package com.schoolapp.feature.home

import androidx.compose.ui.graphics.Color
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.RoleAssignment
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.ScopeType
import com.schoolapp.core.model.branding.Branding
import com.schoolapp.core.testing.TestSessions
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class ShellBrandTest {

    private val branding = Branding("City School", null, "https://cdn/logo.png", "#1F4E79", null)

    @Test
    fun unknown_branding_uses_tokens() {
        assertEquals(ShellBrand(name = null, logoUrl = null, color = AppColors.Primary), null.toShellBrand())
    }

    @Test
    fun app_name_wins_over_school_name() {
        assertEquals("City App", branding.copy(appName = "City App").toShellBrand().name)
        assertEquals("City School", branding.toShellBrand().name)
    }

    @Test
    fun safe_colour_and_logo_are_used() {
        val brand = branding.toShellBrand()
        assertEquals(Color(0xFF1F4E79), brand.color)
        assertEquals("https://cdn/logo.png", brand.logoUrl)
    }

    @Test
    fun low_contrast_colour_falls_back_to_primary() {
        assertEquals(AppColors.Primary, branding.copy(primaryColor = "#FFD700").toShellBrand().color)
    }

    @Test
    fun school_id_comes_from_active_role_assignment() {
        val base = TestSessions.session(RoleKey.PRINCIPAL)
        val session = base.copy(
            assignments = listOf(
                RoleAssignment("a0", RoleKey.TEACHER, ScopeType.BRANCH, schoolId = "other"),
            ) + base.assignments,
        )
        assertEquals("s1", session.brandingSchoolId())
        assertNull(session.copy(activeRole = RoleKey.PARENT).brandingSchoolId())
    }
}
