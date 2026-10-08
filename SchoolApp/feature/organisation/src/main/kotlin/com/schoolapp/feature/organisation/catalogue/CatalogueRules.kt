package com.schoolapp.feature.organisation.catalogue

/** API limits: subject names 2–80, room names 1–60, room capacity 1–1000; names unique ignoring case. */
object CatalogueRules {
    const val SUBJECT_MAX = 80
    const val ROOM_MAX = 60
    private const val SUBJECT_MIN = 2
    private const val CAPACITY_MAX = 1000

    fun maxLength(kind: CatalogueKind): Int = if (kind == CatalogueKind.SUBJECT) SUBJECT_MAX else ROOM_MAX

    fun nameProblem(kind: CatalogueKind, name: String, others: List<String>): CatalogueProblem? {
        val trimmed = name.trim()
        return when {
            trimmed.isEmpty() -> CatalogueProblem.REQUIRED
            kind == CatalogueKind.SUBJECT && trimmed.length < SUBJECT_MIN -> CatalogueProblem.TOO_SHORT
            trimmed.length > maxLength(kind) -> CatalogueProblem.TOO_LONG
            others.any { it.equals(trimmed, ignoreCase = true) } -> CatalogueProblem.DUPLICATE
            else -> null
        }
    }

    fun validCapacity(capacity: Int?): Boolean = capacity != null && capacity in 1..CAPACITY_MAX
}
