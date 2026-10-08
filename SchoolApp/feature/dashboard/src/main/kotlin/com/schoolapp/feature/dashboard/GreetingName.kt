package com.schoolapp.feature.dashboard

/**
 * Name for "Hello, …": the first real given name, skipping initials and short prefixes such as
 * "T", "M.", "Dr" or "Mam" ("T Ayesha 2" -> "Ayesha", "Mam Emaan" -> "Emaan"); the full name when no token qualifies.
 */
internal fun greetingName(fullName: String): String {
    val tokens = fullName.trim().split(' ', '\t').filter { it.isNotEmpty() }
    return tokens.firstOrNull { token ->
        val letters = token.trimEnd('.')
        letters.length > 2 && letters.all { it.isLetter() || it == '-' || it == '\'' } && letters.lowercase() !in TITLES
    } ?: fullName.trim()
}

/** Honorifics people put before a name ("Mam Emaan", "Sir Ali"), compared without the trailing dot. */
private val TITLES = setOf("mr", "mrs", "ms", "miss", "mam", "maam", "ma'am", "madam", "sir", "dr", "prof")
