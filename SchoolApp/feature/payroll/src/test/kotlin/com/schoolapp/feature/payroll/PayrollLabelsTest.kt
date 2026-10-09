package com.schoolapp.feature.payroll

import com.schoolapp.feature.payroll.components.designationLabel
import com.schoolapp.feature.payroll.components.formatHours
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class PayrollLabelsTest {

    @Test
    fun overtime_minutes_read_as_hours() {
        assertEquals("3 h", formatHours(180))
        assertEquals("2 h 30 min", formatHours(150))
        assertEquals("45 min", formatHours(45))
        assertEquals("0 min", formatHours(0))
    }

    @Test
    fun designation_codes_are_humanized_and_free_text_kept() {
        assertEquals("Principal", designationLabel("PRINCIPAL"))
        assertEquals("Vice principal", designationLabel("VICE_PRINCIPAL"))
        assertEquals("Head of Science", designationLabel("Head of Science"))
        assertNull(designationLabel(" "))
        assertNull(designationLabel(null))
    }
}
