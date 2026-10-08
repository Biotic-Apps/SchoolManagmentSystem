package com.schoolapp.feature.organisation.setup

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.academics.CatalogueRepository
import com.schoolapp.core.data.academics.ClassStructureRepository
import com.schoolapp.core.data.common.serverCode
import com.schoolapp.core.data.common.toActionError
import com.schoolapp.core.model.academics.CatalogueSubject
import com.schoolapp.core.model.academics.ClassSubject
import com.schoolapp.core.model.academics.ClassSubjectInput
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

/**
 * The class's subjects, edited in place and saved (debounced) as one ordered list with `PUT /classes/:id/subjects`.
 * Removing a subject that lessons or teachers still use comes back as 409 SUBJECT_IN_USE: the subject returns
 * and the server's reason shows on its row.
 */
internal class CurriculumController(
    private val ctx: SetupContext,
    private val structure: ClassStructureRepository,
    private val catalogue: CatalogueRepository,
    private val debounceMillis: Long = DEBOUNCE_MILLIS,
) {
    private var saved: List<ClassSubject> = emptyList()
    private var pending: Job? = null

    val hasPending: Boolean get() = pending?.isActive == true

    /** Server list after a (re)load; ignored while a local edit waits to be saved. */
    fun sync(subjects: List<ClassSubject>) {
        if (!hasPending) saved = subjects
    }

    fun setPeriods(subjectId: String, periods: Int?) = change(subjectId) { it.copy(periodsPerWeek = periods) }

    fun setGroup(subjectId: String, group: String?) = change(subjectId) { it.copy(group = group) }

    fun setOptional(subjectId: String, optional: Boolean) = change(subjectId) { it.copy(isOptional = optional) }

    fun move(from: Int, to: Int) {
        val items = current()
        if (from !in items.indices || to !in items.indices) return
        commit(items.toMutableList().apply { add(to, removeAt(from)) })
    }

    fun remove(subjectId: String) = commit(current().filterNot { it.subjectId == subjectId })

    fun add(subject: CatalogueSubject) {
        if (current().any { it.subjectId == subject.id }) return
        commit(current() + subject.toClassSubject())
    }

    /** "Create 'Pak Studies'": a new school subject linked to this class in one call. */
    fun createNew(name: String) {
        val schoolId = ctx.schoolId ?: return
        ctx.scope.launch {
            val result = ctx.tracker.track { catalogue.createSubject(schoolId, name, listOf(ctx.classId)) }
            when (result) {
                is AppResult.Failure -> ctx.state.update { it.copy(banner = result.error.toActionError()) }
                is AppResult.Success -> {
                    val created = result.data.toClassSubject()
                    // The server already linked it; keep it in the saved list so a pending edit doesn't drop it.
                    saved = saved + created
                    ctx.state.update { it.copy(schoolSubjects = (it.schoolSubjects + result.data).distinctBy { s -> s.id }) }
                    ctx.updateSetup { setup -> setup.copy(subjects = (setup.subjects + created).distinctBy { it.subjectId }) }
                    if (!hasPending) ctx.afterSave()
                }
            }
        }
    }

    /** Adds the level's preset subjects that are missing, creating school subjects as needed. */
    fun applyPreset(level: ClassLevel) {
        val schoolId = ctx.schoolId ?: return
        ctx.state.update { it.copy(applyingPreset = true) }
        ctx.scope.launch {
            val groups = ctx.state.value.setup?.groups.orEmpty()
            val added = mutableListOf<ClassSubject>()
            for (entry in LevelPresets.subjects(level)) {
                if ((current() + added).any { it.name.equals(entry.name, ignoreCase = true) }) continue
                val subject = ctx.state.value.schoolSubjects.firstOrNull { it.name.equals(entry.name, ignoreCase = true) }
                    ?: when (val created = ctx.tracker.track { catalogue.createSubject(schoolId, entry.name) }) {
                        is AppResult.Success -> created.data.also { s -> ctx.state.update { it.copy(schoolSubjects = it.schoolSubjects + s) } }
                        is AppResult.Failure -> {
                            ctx.state.update { it.copy(banner = created.error.toActionError()) }
                            null
                        }
                    }
                    ?: continue
                added += subject.toClassSubject().copy(
                    periodsPerWeek = entry.periodsPerWeek,
                    isOptional = entry.isOptional,
                    group = entry.group?.takeIf { it in groups },
                )
            }
            ctx.state.update { it.copy(applyingPreset = false) }
            if (added.isNotEmpty()) commit(current() + added)
        }
    }

    private fun current(): List<ClassSubject> = ctx.state.value.subjects

    private fun change(subjectId: String, edit: (ClassSubject) -> ClassSubject) =
        commit(current().map { if (it.subjectId == subjectId) edit(it) else it })

    private fun commit(next: List<ClassSubject>) {
        ctx.updateSetup { it.copy(subjects = next) }
        ctx.state.update { it.copy(subjectErrors = emptyMap()) }
        pending?.cancel()
        pending = ctx.scope.launch {
            delay(debounceMillis)
            flush(next)
        }
    }

    private suspend fun flush(next: List<ClassSubject>) {
        val before = saved
        val result = ctx.tracker.track {
            structure.setClassSubjects(ctx.classId, next.map { ClassSubjectInput(it.subjectId, it.periodsPerWeek, it.isOptional, it.group) })
        }
        pending = null
        when (result) {
            is AppResult.Success -> {
                saved = result.data
                ctx.updateSetup { it.copy(subjects = result.data) }
            }
            is AppResult.Failure -> {
                val error = result.error.toActionError()
                val removed = before.firstOrNull { old -> next.none { it.subjectId == old.subjectId } }
                ctx.updateSetup { it.copy(subjects = before) }
                ctx.state.update {
                    if (removed != null && result.error.serverCode == SUBJECT_IN_USE) {
                        it.copy(subjectErrors = mapOf(removed.subjectId to error))
                    } else {
                        it.copy(banner = error)
                    }
                }
            }
        }
        ctx.afterSave()
    }

    private fun CatalogueSubject.toClassSubject() = ClassSubject(id, code, name, null, false, null)

    companion object {
        const val DEBOUNCE_MILLIS = 600L
        const val SUBJECT_IN_USE = "SUBJECT_IN_USE"
    }
}
