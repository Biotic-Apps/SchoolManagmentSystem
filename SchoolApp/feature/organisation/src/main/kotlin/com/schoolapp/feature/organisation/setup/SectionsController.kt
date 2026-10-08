package com.schoolapp.feature.organisation.setup

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.academics.CatalogueRepository
import com.schoolapp.core.data.academics.ClassStructureRepository
import com.schoolapp.core.data.academics.TeacherAllocationRepository
import com.schoolapp.core.data.common.toActionError
import com.schoolapp.core.model.academics.NamedRef
import com.schoolapp.core.model.academics.NewSection
import com.schoolapp.core.model.academics.SectionChange
import com.schoolapp.core.model.academics.SetupSection
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

/**
 * Sections card: add (next letter), seats (debounced stepper), room with "+ New room", group, class teacher,
 * remove (409 SECTION_IN_USE explains why in the confirm dialog). Each change is shown at once and autosaved.
 */
internal class SectionsController(
    private val ctx: SetupContext,
    private val structure: ClassStructureRepository,
    private val allocation: TeacherAllocationRepository,
    private val catalogue: CatalogueRepository,
    private val debounceMillis: Long = CurriculumController.DEBOUNCE_MILLIS,
) {
    private val seatJobs = mutableMapOf<String, Job>()

    fun add() {
        val state = ctx.state.value
        val sessionId = state.setup?.sessionId ?: ctx.sessionId
        if (sessionId == null || state.addingSection) return
        val sections = state.sections
        val name = SectionNames.next(sections.map { it.name })
        ctx.state.update { it.copy(addingSection = true) }
        ctx.scope.launch {
            val capacity = sections.lastOrNull()?.capacity ?: DEFAULT_SEATS
            ctx.save { structure.addSection(NewSection(ctx.branchId, sessionId, ctx.classId, name, capacity)) }
            ctx.state.update { it.copy(addingSection = false) }
        }
    }

    fun setSeats(sectionId: String, seats: Int) {
        local(sectionId) { it.copy(capacity = seats) }
        seatJobs.remove(sectionId)?.cancel()
        seatJobs[sectionId] = ctx.scope.launch {
            delay(debounceMillis)
            ctx.save { structure.updateSection(sectionId, SectionChange.Capacity(seats)) }
        }
    }

    fun setRoom(sectionId: String, roomId: String?) {
        val room = roomId?.let { id -> ctx.state.value.rooms.firstOrNull { it.id == id }?.let { NamedRef(it.id, it.name) } }
        local(sectionId) { it.copy(room = room) }
        ctx.scope.launch { ctx.save { structure.updateSection(sectionId, SectionChange.Room(roomId)) } }
    }

    /** "+ New room" from a section's room picker: creates it in the branch and puts it on that section. */
    fun createRoom(sectionId: String, name: String) {
        ctx.scope.launch {
            when (val created = ctx.tracker.track { catalogue.createRoom(ctx.branchId, name) }) {
                is AppResult.Failure -> ctx.state.update { it.copy(banner = created.error.toActionError()) }
                is AppResult.Success -> {
                    ctx.state.update { it.copy(rooms = (it.rooms + created.data).sortedBy { r -> r.name.lowercase() }) }
                    setRoom(sectionId, created.data.id)
                }
            }
        }
    }

    fun setGroup(sectionId: String, group: String?) {
        local(sectionId) { it.copy(group = group) }
        ctx.scope.launch { ctx.save { structure.updateSection(sectionId, SectionChange.Group(group)) } }
    }

    fun setClassTeacher(sectionId: String, staffId: String?) {
        val teacher = staffId?.let { id -> ctx.state.value.staff.firstOrNull { it.id == id }?.let { NamedRef(it.id, it.name) } }
        local(sectionId) { it.copy(classTeacher = teacher) }
        ctx.scope.launch { ctx.save { allocation.setClassTeacher(sectionId, staffId) } }
    }

    fun askRemove(section: SetupSection) = ctx.state.update { it.copy(removeSection = section, removeError = null) }

    fun dismissRemove() = ctx.state.update { it.copy(removeSection = null, removeError = null, removing = false) }

    fun confirmRemove() {
        val target = ctx.state.value.removeSection ?: return
        ctx.state.update { it.copy(removing = true, removeError = null) }
        ctx.scope.launch {
            when (val result = ctx.tracker.track { structure.archiveSection(target.id) }) {
                is AppResult.Failure -> ctx.state.update { it.copy(removing = false, removeError = result.error.toActionError()) }
                is AppResult.Success -> {
                    ctx.state.update { it.copy(removing = false, removeSection = null) }
                    ctx.updateSetup { setup -> setup.copy(sections = setup.sections.filterNot { it.id == target.id }) }
                    ctx.afterSave()
                }
            }
        }
    }

    private fun local(sectionId: String, change: (SetupSection) -> SetupSection) =
        ctx.updateSetup { setup -> setup.copy(sections = setup.sections.map { if (it.id == sectionId) change(it) else it }) }

    private companion object {
        const val DEFAULT_SEATS = 40
    }
}

/** Next unused section letter: A, B, … Z, then "S27" (same rule as the web). */
object SectionNames {
    fun next(taken: List<String>): String {
        val used = taken.map { it.trim().uppercase() }.toSet()
        return ('A'..'Z').map { it.toString() }.firstOrNull { it !in used } ?: "S${used.size + 1}"
    }
}
