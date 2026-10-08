package com.schoolapp.feature.dashboard

/**
 * Name for "Hello, …": the first real given name, skipping initials and short prefixes such as
 * "T", "M." or "Dr" ("T Ayesha 2" -> "Ayesha"); the full name when no token qualifies.
 */
internal fun greetingName(fullName: String): String {
    val tokens = fullName.trim().split(' ', '\t').filter { it.isNotEmpty() }
    return tokens.firstOrNull { token ->
        val letters = token.trimEnd('.')
        letters.length > 2 && letters.all { it.isLetter() || it == '-' || it == '\'' } && letters.lowercase() !in TITLES
    } ?: fullName.trim()
}

private val TITLES = setOf("mr", "mrs", "ms", "miss", "dr", "prof", "sir", "madam")
