package com.schoolapp.core.data.health

import com.schoolapp.core.network.NetworkJson
import com.schoolapp.core.network.dto.health.HealthAlertDto
import kotlinx.serialization.builtins.ListSerializer
import org.junit.Assert.assertEquals
import org.junit.Test

class HealthAlertMapperTest {

    @Test
    fun alert_reads_flat_name_and_allergy_objects_from_live_api() {
        // Captured from GET /health/alerts?sectionId=… (principal, demo school).
        val alerts = NetworkJson.decodeFromString(
            ListSerializer(HealthAlertDto.serializer()),
            """[{"studentId":"01a1100a-a9fc-705b-936a-127170d3d3eb","name":"Fatima Raza","rollNo":3,
                "allergies":[{"name":"Peanuts","reaction":"Swelling, breathing difficulty","severity":"SEVERE"}],
                "instructions":"Carries an inhaler; no peanut snacks."}]""",
        ).mapNotNull { it.toModel() }
        val alert = alerts.single()
        assertEquals("01a1100a-a9fc-705b-936a-127170d3d3eb", alert.studentId)
        assertEquals("Fatima Raza", alert.studentName)
        assertEquals(listOf("Peanuts"), alert.allergies)
        assertEquals("Carries an inhaler; no peanut snacks.", alert.instructions)
    }

    @Test
    fun alert_falls_back_to_nested_student_name() {
        val alert = NetworkJson.decodeFromString(
            HealthAlertDto.serializer(),
            """{"student":{"id":"s1","name":"Ali"},"allergies":["Dust"]}""",
        ).toModel()
        assertEquals("Ali", alert?.studentName)
        assertEquals(listOf("Dust"), alert?.allergies)
    }
}
