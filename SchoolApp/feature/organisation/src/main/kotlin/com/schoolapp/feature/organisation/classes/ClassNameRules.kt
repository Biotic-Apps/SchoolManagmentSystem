package com.schoolapp.feature.organisation.classes

/** Class names: required, at most 40 characters (API limit), unique in the school ignoring case. */
object ClassNameRules {
    const val MAX_LENGTH = 40

    fun problem(name: String, existing: List<String>, current: String? = null): ClassNameProblem? {
        val trimmed = name.trim()
        return when {
            trimmed.isEmpty() -> ClassNameProblem.REQUIRED
            trimmed.length > MAX_LENGTH -> ClassNameProblem.TOO_LONG
            existing.any { it.equals(trimmed, ignoreCase = true) && !it.equals(current, ignoreCase = true) } -> ClassNameProblem.DUPLICATE
            else -> null
        }
    }
}
