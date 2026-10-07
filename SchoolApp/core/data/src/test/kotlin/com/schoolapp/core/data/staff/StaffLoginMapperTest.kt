package com.schoolapp.core.data.staff

import com.schoolapp.core.network.NetworkJson
import com.schoolapp.core.network.dto.staff.StaffSummaryDto
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class StaffLoginMapperTest {

    @Test
    fun staff_summary_keeps_the_login_user_id_for_assignment() {
        val withLogin = NetworkJson.decodeFromString(StaffSummaryDto.serializer(), """{"id":"st1","userId":"u7","name":"Sana"}""")
        val withoutLogin = NetworkJson.decodeFromString(StaffSummaryDto.serializer(), """{"id":"st2","name":"Usman"}""")
        assertEquals("u7", withLogin.toModel().userId)
        assertNull(withoutLogin.toModel().userId)
    }
}
