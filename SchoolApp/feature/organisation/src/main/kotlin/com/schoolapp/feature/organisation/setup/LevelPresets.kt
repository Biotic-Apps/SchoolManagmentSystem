package com.schoolapp.feature.organisation.setup

/** A level's usual subjects with periods per week (contract §5.1; same table as the web's level-presets.ts). */
data class PresetSubject(val name: String, val periodsPerWeek: Int, val group: String? = null, val isOptional: Boolean = false)

enum class ClassLevel { EARLY, PRIMARY, MIDDLE, MATRIC }

object LevelPresets {
    /** Matric sections are usually split into these groups. */
    val MATRIC_GROUPS = listOf("Science", "Arts")

    private val early = listOf(
        PresetSubject("English", 6), PresetSubject("Urdu", 6), PresetSubject("Mathematics", 6),
        PresetSubject("Nazra Quran", 4), PresetSubject("General Knowledge", 3), PresetSubject("Art & Drawing", 3),
    )
    private val primary = listOf(
        PresetSubject("English", 6), PresetSubject("Urdu", 6), PresetSubject("Mathematics", 6),
        PresetSubject("General Science", 4), PresetSubject("Islamiat", 3), PresetSubject("Social Studies", 3),
        PresetSubject("Nazra Quran", 3), PresetSubject("Computer Science", 2),
    )
    private val middle = listOf(
        PresetSubject("English", 6), PresetSubject("Urdu", 6), PresetSubject("Mathematics", 6),
        PresetSubject("General Science", 6), PresetSubject("Islamiat", 3), PresetSubject("Social Studies", 4),
        PresetSubject("Computer Science", 3), PresetSubject("Tarjuma-tul-Quran", 2),
    )
    private val matric = listOf(
        PresetSubject("English", 6), PresetSubject("Urdu", 5), PresetSubject("Mathematics", 6),
        PresetSubject("Islamiat", 3), PresetSubject("Pakistan Studies", 3), PresetSubject("Tarjuma-tul-Quran", 2),
        PresetSubject("Physics", 6, "Science"), PresetSubject("Chemistry", 6, "Science"), PresetSubject("Biology", 6, "Science"),
        PresetSubject("Computer Science", 6, "Science", isOptional = true),
        PresetSubject("General Science", 6, "Arts"), PresetSubject("Civics", 6, "Arts"), PresetSubject("Economics", 6, "Arts"),
    )

    fun subjects(level: ClassLevel): List<PresetSubject> = when (level) {
        ClassLevel.EARLY -> early
        ClassLevel.PRIMARY -> primary
        ClassLevel.MIDDLE -> middle
        ClassLevel.MATRIC -> matric
    }
}
