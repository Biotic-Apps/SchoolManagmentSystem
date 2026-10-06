package com.schoolapp.feature.exams.entry

enum class MarkError { INVALID, NEGATIVE, TOO_HIGH, TOO_MANY_DECIMALS }

/** Typed marks: blank is pending (never 0); "0" is a real entered mark. */
sealed interface ParsedMarks {
    data object Blank : ParsedMarks
    data class Value(val marks: Double) : ParsedMarks
    data class Invalid(val error: MarkError) : ParsedMarks
}

internal object MarksValidation {
    private val number = Regex("""^(\d+(\.\d*)?|\.\d+)$""")
    private val allowed = Regex("""[^0-9.,\-]""")
    private const val MAX_DECIMALS = 2
    private const val MAX_LENGTH = 8

    /** Keeps only characters a marks field can hold (number pads may add spaces or grouping). */
    fun sanitize(input: String): String = input.replace(allowed, "").take(MAX_LENGTH)

    fun parse(text: String, maxMarks: Double): ParsedMarks {
        val value = text.trim().replace(',', '.')
        if (value.isEmpty()) return ParsedMarks.Blank
        if (value.startsWith("-")) {
            return ParsedMarks.Invalid(if (number.matches(value.drop(1))) MarkError.NEGATIVE else MarkError.INVALID)
        }
        if (!number.matches(value)) return ParsedMarks.Invalid(MarkError.INVALID)
        val marks = value.toDoubleOrNull() ?: return ParsedMarks.Invalid(MarkError.INVALID)
        return when {
            value.substringAfter('.', "").length > MAX_DECIMALS -> ParsedMarks.Invalid(MarkError.TOO_MANY_DECIMALS)
            marks > maxMarks -> ParsedMarks.Invalid(MarkError.TOO_HIGH)
            else -> ParsedMarks.Value(marks)
        }
    }
}
