package com.schoolapp.feature.admin.schools.setup

import com.schoolapp.feature.admin.common.AdminFormRules
import com.schoolapp.feature.admin.schools.setup.model.BellPart
import com.schoolapp.feature.admin.schools.setup.model.BranchPart
import com.schoolapp.feature.admin.schools.setup.model.ClassLevel
import com.schoolapp.feature.admin.schools.setup.model.ClassRow
import com.schoolapp.feature.admin.schools.setup.model.PrincipalPart
import com.schoolapp.feature.admin.schools.setup.model.SchoolPart
import com.schoolapp.feature.admin.schools.setup.model.SetupDefaults
import com.schoolapp.feature.admin.schools.setup.model.SetupForm
import com.schoolapp.feature.admin.schools.setup.model.SetupPresets

/** Every field edit of the wizard, as pure changes of [SetupForm] handed to [update]. */
class SetupFormEdits internal constructor(private val update: ((SetupForm) -> SetupForm) -> Unit) {

    /** The code follows the name ("Bright Star School" → BSS) until the admin types a different one. */
    fun schoolName(name: String) = update { form ->
        val school = form.school
        form.copy(school = school.copy(name = name, code = if (school.codeSuggested) SetupDefaults.codeFromName(name) else school.code))
    }

    fun schoolCode(code: String) = update { form ->
        val clean = AdminFormRules.cleanCode(code)
        val suggested = clean.isEmpty() || clean == SetupDefaults.codeFromName(form.school.name)
        form.copy(school = form.school.copy(code = clean, codeSuggested = suggested))
    }

    fun school(change: (SchoolPart) -> SchoolPart) = update { it.copy(school = change(it.school)) }

    fun branch(change: (BranchPart) -> BranchPart) = update { it.copy(branch = change(it.branch)) }

    fun principal(change: (PrincipalPart) -> PrincipalPart) = update { it.copy(principal = change(it.principal)) }

    fun createSession(on: Boolean) = update { it.copy(academics = it.academics.copy(createSession = on)) }

    /** The session name follows the dates ("2026-27") until the admin types their own. */
    fun sessionDates(start: String, end: String) = update { form ->
        val a = form.academics
        val suggested = SetupDefaults.sessionNameFor(start, end)
        val name = if (a.sessionNameSuggested && suggested.isNotEmpty()) suggested else a.sessionName
        form.copy(academics = a.copy(startDate = start, endDate = end, sessionName = name))
    }

    fun sessionName(name: String) = update { form ->
        val a = form.academics
        form.copy(academics = a.copy(sessionName = name, sessionNameSuggested = name == SetupDefaults.sessionNameFor(a.startDate, a.endDate)))
    }

    fun classRow(id: Long, change: (ClassRow) -> ClassRow) = update { form ->
        form.copy(academics = form.academics.copy(classes = form.academics.classes.map { if (it.id == id) change(it) else it }))
    }

    fun addClass(name: String) = update { form ->
        val trimmed = name.trim()
        if (trimmed.isEmpty()) return@update form
        val id = (form.academics.classes.maxOfOrNull { it.id } ?: -1) + 1
        val row = SetupPresets.newClassRow(id, trimmed, ClassLevel.CUSTOM, custom = true)
        form.copy(academics = form.academics.copy(classes = form.academics.classes + row))
    }

    fun removeClass(id: Long) = update { form ->
        form.copy(academics = form.academics.copy(classes = form.academics.classes.filterNot { it.id == id && it.custom }))
    }

    /** A new matrix column; ignored when a subject with that name (any case) exists. */
    fun addSubject(name: String) = update { form ->
        val trimmed = name.trim()
        val columns = form.academics.subjectNames
        if (trimmed.isEmpty() || columns.any { it.equals(trimmed, ignoreCase = true) }) return@update form
        form.copy(academics = form.academics.copy(subjectNames = columns + trimmed))
    }

    /** Resets the subjects of every ticked class of [level] to the level's preset. */
    fun applyPreset(level: ClassLevel) = update { form ->
        val classes = form.academics.classes.map {
            if (it.include && it.level == level) it.copy(subjects = SetupPresets.presetSubjects(level)) else it
        }
        form.copy(academics = form.academics.copy(classes = classes))
    }

    fun bell(change: (BellPart) -> BellPart) = update { it.copy(bell = change(it.bell)) }
}
