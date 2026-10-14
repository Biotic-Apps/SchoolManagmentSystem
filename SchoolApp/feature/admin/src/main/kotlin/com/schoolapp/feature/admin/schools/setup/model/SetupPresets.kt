package com.schoolapp.feature.admin.schools.setup.model

/** Class levels of the wizard (API LEVELS). */
enum class ClassLevel { EARLY, PRIMARY, MIDDLE, MATRIC, CUSTOM }

data class PresetSubject(val name: String, val periodsPerWeek: Int, val group: String = "")

data class LevelPreset(val level: ClassLevel, val classNames: List<String>, val subjects: List<PresetSubject>)

/** Same table as the web `classes/level-presets.ts` (editable starting points; boards differ). */
object SetupPresets {
    val MATRIC_GROUPS = listOf("Science", "Arts")
    val SECTION_LETTERS = listOf("A", "B", "C", "D")
    const val MAX_SECTIONS = 8
    const val MAX_PERIODS_PER_WEEK = 20
    const val DEFAULT_PERIODS = 4

    private fun s(name: String, periods: Int, group: String = "") = PresetSubject(name, periods, group)

    val LEVELS: List<LevelPreset> = listOf(
        LevelPreset(
            ClassLevel.EARLY,
            listOf("Playgroup", "Nursery", "Prep"),
            listOf(s("English", 6), s("Urdu", 6), s("Mathematics", 6), s("Nazra Quran", 4), s("General Knowledge", 3), s("Art & Drawing", 3)),
        ),
        LevelPreset(
            ClassLevel.PRIMARY,
            listOf("Class 1", "Class 2", "Class 3", "Class 4", "Class 5"),
            listOf(
                s("English", 6), s("Urdu", 6), s("Mathematics", 6), s("General Science", 4),
                s("Islamiat", 3), s("Social Studies", 3), s("Nazra Quran", 3), s("Computer Science", 2),
            ),
        ),
        LevelPreset(
            ClassLevel.MIDDLE,
            listOf("Class 6", "Class 7", "Class 8"),
            listOf(
                s("English", 6), s("Urdu", 6), s("Mathematics", 6), s("General Science", 6),
                s("Islamiat", 3), s("Social Studies", 4), s("Computer Science", 3), s("Tarjuma-tul-Quran", 2),
            ),
        ),
        LevelPreset(
            ClassLevel.MATRIC,
            listOf("Class 9", "Class 10"),
            listOf(
                s("English", 6), s("Urdu", 5), s("Mathematics", 6), s("Islamiat", 3), s("Pakistan Studies", 3),
                s("Tarjuma-tul-Quran", 2), s("Physics", 6, "Science"), s("Chemistry", 6, "Science"), s("Biology", 6, "Science"),
                s("Computer Science", 6, "Science"), s("General Science", 6, "Arts"), s("Civics", 6, "Arts"), s("Economics", 6, "Arts"),
            ),
        ),
    )

    fun presetFor(level: ClassLevel): LevelPreset? = LEVELS.firstOrNull { it.level == level }

    /** Matric classes start as A (Science) and B (Arts); everyone else as A. */
    fun defaultSections(level: ClassLevel): List<SectionRow> =
        if (level == ClassLevel.MATRIC) MATRIC_GROUPS.mapIndexed { i, group -> SectionRow(SECTION_LETTERS[i], group) } else listOf(SectionRow("A"))

    fun presetSubjects(level: ClassLevel): List<SubjectCell> =
        presetFor(level)?.subjects.orEmpty().map { SubjectCell(it.name, it.periodsPerWeek, it.group) }

    /** A new subject cell for [level]: the preset's periods and group, else 4 periods for every section. */
    fun cellFor(level: ClassLevel, subject: String): SubjectCell {
        val preset = presetFor(level)?.subjects?.firstOrNull { it.name == subject }
        return SubjectCell(subject, preset?.periodsPerWeek ?: DEFAULT_PERIODS, preset?.group.orEmpty())
    }

    fun newClassRow(id: Long, name: String, level: ClassLevel, custom: Boolean = false) =
        ClassRow(id = id, name = name, level = level, custom = custom, sections = defaultSections(level), subjects = presetSubjects(level))

    /** Every preset class, ticked, with its level's sections and subjects. */
    fun defaultClassRows(): List<ClassRow> {
        var id = 0L
        return LEVELS.flatMap { preset -> preset.classNames.map { newClassRow(id++, it, preset.level) } }
    }

    /** Matrix columns: preset subjects in first-seen order. */
    fun defaultSubjectNames(): List<String> = LEVELS.flatMap { level -> level.subjects.map { it.name } }.distinct()

    /** Next free section letter A–H, or null when all are used. */
    fun nextLetter(sections: List<SectionRow>): String? {
        val used = sections.map { it.name }.toSet()
        return ('A' until 'A' + MAX_SECTIONS).map(Char::toString).firstOrNull { it !in used }
    }

    /** "A (Science), B (Arts)". */
    fun sectionsText(sections: List<SectionRow>): String =
        sections.joinToString(", ") { if (it.group.isNotBlank()) "${it.name} (${it.group})" else it.name }
}
