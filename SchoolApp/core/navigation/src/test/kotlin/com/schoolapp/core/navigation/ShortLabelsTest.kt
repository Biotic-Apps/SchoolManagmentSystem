package com.schoolapp.core.navigation

import org.junit.Assert.assertTrue
import org.junit.Test

class ShortLabelsTest {

    @Test
    fun every_catalogue_entry_has_a_compact_short_label() {
        NavigationCatalog.entries.forEach { item ->
            assertTrue("${item.id} has no short label", ShortLabels.containsKey(item.id))
            assertTrue("${item.id} short label too long", item.shortLabel.length <= 12)
        }
    }
}
