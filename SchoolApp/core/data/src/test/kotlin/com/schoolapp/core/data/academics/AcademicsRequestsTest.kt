package com.schoolapp.core.data.academics

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.data.common.detailLines
import com.schoolapp.core.data.common.serverCode
import com.schoolapp.core.model.academics.SectionChange
import org.junit.Assert.assertEquals
import org.junit.Test

class AcademicsRequestsTest {

    @Test
    fun clearing_room_or_group_sends_an_explicit_null() {
        assertEquals("""{"roomId":null}""", SectionChange.Room(null).toBody().toString())
        assertEquals("""{"group":null}""", SectionChange.Group(null).toBody().toString())
        assertEquals("""{"group":"Science"}""", SectionChange.Group("Science").toBody().toString())
        assertEquals("""{"capacity":42}""", SectionChange.Capacity(42).toBody().toString())
    }

    @Test
    fun detail_lines_read_strings_and_conflict_messages() {
        val inUse = AppError.Server(409, "SUBJECT_IN_USE", "In use", """["English: 2 teacher assignments, 11 lessons"]""")
        assertEquals(listOf("English: 2 teacher assignments, 11 lessons"), inUse.detailLines())
        assertEquals("SUBJECT_IN_USE", inUse.serverCode)
        val conflicts = AppError.Server(409, "TIMETABLE_CONFLICTS", "x", """[{"type":"T","message":"Mon P1: clash"}]""")
        assertEquals(listOf("Mon P1: clash"), conflicts.detailLines())
        assertEquals(emptyList<String>(), AppError.Server(409, null, null, """{"field":"name"}""").detailLines())
        assertEquals("OWN_ASSIGNMENT", AppError.Forbidden("OWN_ASSIGNMENT", "Ask the principal").serverCode)
    }
}
