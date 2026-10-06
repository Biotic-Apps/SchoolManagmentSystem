package com.schoolapp.feature.approvals

import com.schoolapp.feature.approvals.detail.components.detailLabel
import com.schoolapp.feature.approvals.detail.components.detailValue
import org.junit.Assert.assertEquals
import org.junit.Test

class DetailValuesTest {

    @Test
    fun minor_amount_keys_are_formatted_as_money() {
        assertEquals("Rs 12,500", detailValue("amountMinor", "1250000"))
        assertEquals("Rs 3,150,000", detailValue("netMinor", "315000000"))
        assertEquals("Rs 12,500.50", detailValue("lines.totalMinor", "1250050"))
    }

    @Test
    fun minor_labels_drop_the_suffix() {
        assertEquals("Amount", detailLabel("amountMinor"))
        assertEquals("Total", detailLabel("order.totalMinor"))
        assertEquals("Staff count", detailLabel("staffCount"))
    }

    @Test
    fun other_values_keep_their_text_and_enums_and_months_are_humanized() {
        assertEquals("25", detailValue("value", "25"))
        assertEquals("abc", detailValue("amountMinor", "abc"))
        assertEquals("School leaving", detailValue("type", "SCHOOL_LEAVING"))
        assertEquals("Percent", detailValue("type", "PERCENT"))
        assertEquals("September 2026", detailValue("month", "2026-09"))
        assertEquals("RCPT-MAIN-2026-0142", detailValue("receiptNo", "RCPT-MAIN-2026-0142"))
        assertEquals("B", detailValue("sectionName", "B"))
        assertEquals("1250000", detailValue("amount", "1250000"))
    }
}
