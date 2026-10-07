package com.schoolapp.core.designsystem.brand

import androidx.compose.ui.graphics.Color
import com.schoolapp.core.designsystem.theme.AppColors
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class BrandColorTest {

    @Test
    fun default_teal_passes_aa_contrast() {
        assertEquals(Color(0xFF0B7F74), BrandColor.contrastSafeOrNull("#0B7F74"))
        assertTrue(BrandColor.contrastAgainstWhite(Color(0xFF0B7F74)) >= BrandColor.MIN_CONTRAST)
    }

    @Test
    fun default_token_is_the_teal_primary() {
        assertEquals(Color(0xFF0B7F74), AppColors.Primary)
    }

    @Test
    fun white_fails() {
        assertNull(BrandColor.contrastSafeOrNull("#FFFFFF"))
        assertNull(BrandColor.contrastSafeOrNull("#ffffff"))
    }

    @Test
    fun light_yellow_fails() {
        assertNull(BrandColor.contrastSafeOrNull("#FFD700"))
    }

    @Test
    fun threshold_greys() {
        assertEquals(4.54, BrandColor.contrastAgainstWhite(Color(0xFF767676)), 0.01)
        assertNotNull(BrandColor.contrastSafeOrNull("#767676"))
        assertEquals(4.48, BrandColor.contrastAgainstWhite(Color(0xFF777777)), 0.01)
        assertNull(BrandColor.contrastSafeOrNull("#777777"))
    }

    @Test
    fun invalid_values_are_rejected() {
        listOf(null, "", "red", "#12345", "#GGGGGG", "#7A29441", "#7A2944FF").forEach {
            assertNull("expected null for $it", BrandColor.contrastSafeOrNull(it))
        }
    }

    @Test
    fun hash_is_optional_and_whitespace_trimmed() {
        assertEquals(Color(0xFF0B7F74), BrandColor.contrastSafeOrNull("0B7F74"))
        assertEquals(Color(0xFF0B7F74), BrandColor.contrastSafeOrNull(" #0b7f74 "))
    }

    @Test
    fun primary_or_default_falls_back_to_token() {
        assertEquals(AppColors.Primary, BrandColor.primaryOrDefault(null))
        assertEquals(AppColors.Primary, BrandColor.primaryOrDefault("#FFD700"))
        assertEquals(AppColors.Primary, BrandColor.primaryOrDefault("red"))
        assertEquals(Color(0xFF1F4E79), BrandColor.primaryOrDefault("#1F4E79"))
    }
}
