package com.schoolapp.feature.admin.schools.setup.model

import java.time.LocalDate
import java.time.ZoneId

/** Starting values of the wizard (web form-defaults.ts, presets.ts, use-code-suggestion.ts). */
object SetupDefaults {
    private val KARACHI: ZoneId = ZoneId.of("Asia/Karachi")
    private val SKIP = setOf("THE", "OF", "AND")
    private const val APRIL = 4
    private const val ONE_WORD_CODE = 4
    private const val INITIALS_CODE = 6

    fun form(): SetupForm {
        val (start, end) = sessionDates()
        return SetupForm(
            academics = AcademicsPart(
                sessionName = sessionNameFor(start, end),
                startDate = start,
                endDate = end,
                classes = SetupPresets.defaultClassRows(),
                subjectNames = SetupPresets.defaultSubjectNames(),
            ),
        )
    }

    /** 1 April of the current school year → 31 March next year (Asia/Karachi). */
    fun sessionDates(today: LocalDate = LocalDate.now(KARACHI)): Pair<String, String> {
        val startYear = if (today.monthValue >= APRIL) today.year else today.year - 1
        return LocalDate.of(startYear, APRIL, 1).toString() to LocalDate.of(startYear + 1, 3, 31).toString()
    }

    /** "2026-04-01" + "2027-03-31" → "2026-27"; same year → "2026". */
    fun sessionNameFor(startDate: String, endDate: String): String {
        val start = startDate.take(4)
        val end = endDate.take(4)
        if (start.length != 4 || !start.all(Char::isDigit)) return ""
        if (end.length != 4 || !end.all(Char::isDigit) || end == start) return start
        return "$start-${end.takeLast(2)}"
    }

    /** "Bright Star School" → "BSS"; empty when the name gives fewer than 2 letters. */
    fun codeFromName(name: String): String {
        val words = name.uppercase().replace(Regex("[^A-Z0-9 ]"), " ").split(Regex("\\s+")).filter { it.isNotEmpty() && it !in SKIP }
        val code = if (words.size == 1) words[0].take(ONE_WORD_CODE) else words.joinToString("") { it.take(1) }.take(INITIALS_CODE)
        return if (code.length >= 2) code else ""
    }
}
