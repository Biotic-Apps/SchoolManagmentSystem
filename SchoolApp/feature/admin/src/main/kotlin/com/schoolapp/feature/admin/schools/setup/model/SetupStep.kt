package com.schoolapp.feature.admin.schools.setup.model

import androidx.annotation.StringRes
import com.schoolapp.feature.admin.R

/** Wizard steps in order; [prefixes] are the field keys each step validates (web steps.ts). */
enum class SetupStep(@StringRes val label: Int, @StringRes val title: Int, @StringRes val helper: Int, val prefixes: List<String>) {
    SCHOOL(R.string.setup_step_school, R.string.setup_title_school, R.string.setup_helper_school, listOf("school")),
    BRANCH(R.string.setup_step_branch, R.string.setup_title_branch, R.string.setup_helper_branch, listOf("branch")),
    PEOPLE(
        R.string.setup_step_people,
        R.string.setup_title_people,
        R.string.setup_helper_people,
        listOf("principal", "academics.createSession", "academics.sessionName", "academics.startDate", "academics.endDate"),
    ),
    CLASSES(R.string.setup_step_classes, R.string.setup_title_classes, R.string.setup_helper_classes, listOf("academics.classes", "academics.subjectNames")),
    BELL(R.string.setup_step_bell, R.string.setup_title_bell, R.string.setup_helper_bell, listOf("bell")),
    REVIEW(R.string.setup_step_review, R.string.setup_title_review, R.string.setup_helper_review, emptyList()),
    ;

    fun owns(key: String): Boolean = prefixes.any { key == it || key.startsWith("$it.") }

    companion object {
        /** Step that owns a field key such as "school.code" or "academics.classes.3.name"; null when none. */
        fun forKey(key: String): SetupStep? = entries.firstOrNull { it.owns(key) }
    }
}
