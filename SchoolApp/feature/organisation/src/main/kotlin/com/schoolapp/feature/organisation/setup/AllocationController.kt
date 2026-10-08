package com.schoolapp.feature.organisation.setup

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.academics.TeacherAllocationRepository
import com.schoolapp.core.data.common.toActionError
import com.schoolapp.core.model.academics.AllocationCell
import com.schoolapp.core.model.academics.ClassSetup
import com.schoolapp.core.model.academics.NamedRef
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

/** Teachers card: one teacher per subject × section (`PUT /sections/:id/subject-teachers/:subjectId`). */
internal class AllocationController(
    private val ctx: SetupContext,
    private val allocation: TeacherAllocationRepository,
) {
    fun setTeacher(sectionId: String, subjectId: String, staffId: String?) {
        local(sectionId, subjectId, staffId)
        ctx.scope.launch { ctx.save { allocation.setSubjectTeacher(sectionId, subjectId, staffId) } }
    }

    /** Gives every section of the subject the teacher of the first section that has one. */
    fun sameForAll(subjectId: String) {
        val setup = ctx.state.value.setup ?: return
        val subject = setup.subjects.firstOrNull { it.subjectId == subjectId } ?: return
        val targets = setup.sectionsFor(subject)
        val source = targets.firstNotNullOfOrNull { setup.cell(it.id, subjectId)?.staff } ?: return
        val todo = targets.filter { setup.cell(it.id, subjectId)?.staff?.id != source.id }
        if (todo.isEmpty()) return
        ctx.state.update { it.copy(fillingSubjectId = subjectId) }
        ctx.scope.launch {
            for (section in todo) {
                local(section.id, subjectId, source.id)
                val result = ctx.tracker.track { allocation.setSubjectTeacher(section.id, subjectId, source.id) }
                if (result is AppResult.Failure) {
                    ctx.state.update { it.copy(banner = result.error.toActionError()) }
                    break
                }
            }
            ctx.state.update { it.copy(fillingSubjectId = null) }
            ctx.afterSave()
        }
    }

    private fun local(sectionId: String, subjectId: String, staffId: String?) {
        val teacher = staffId?.let { id -> ctx.state.value.staff.firstOrNull { it.id == id }?.let { NamedRef(it.id, it.name) } }
        ctx.updateSetup { it.withTeacher(sectionId, subjectId, teacher) }
    }
}

internal fun ClassSetup.withTeacher(sectionId: String, subjectId: String, teacher: NamedRef?): ClassSetup {
    val existing = cell(sectionId, subjectId)
    val updated = existing?.copy(staff = teacher) ?: AllocationCell(sectionId, subjectId, teacher, 0)
    return copy(allocation = allocation.filterNot { it.sectionId == sectionId && it.subjectId == subjectId } + updated)
}
