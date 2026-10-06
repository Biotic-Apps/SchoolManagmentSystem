package com.schoolapp.feature.diary.subjects

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.organisation.OrganisationRepository
import com.schoolapp.core.data.timetable.TimetableRepository
import com.schoolapp.core.model.organisation.Section
import com.schoolapp.core.model.organisation.Subject
import com.schoolapp.core.model.timetable.TeacherSlot
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import java.time.LocalDate
import javax.inject.Inject

/** Subjects a section is taught by the signed-in teacher; slots carry only names, so ids are resolved by name. */
data class TaughtSubjects(val subjects: List<Subject>, val complete: Boolean)

class TeacherSubjects @Inject constructor(
    private val authRepository: AuthRepository,
    private val timetableRepository: TimetableRepository,
    private val organisationRepository: OrganisationRepository,
) {
    /** Every subject of the active school (pickers and name lookup). */
    suspend fun all(): AppResult<List<Subject>> {
        val session = authRepository.session.filterNotNull().first()
        val schoolId = session.activeAssignments.firstNotNullOfOrNull { it.schoolId }
        return organisationRepository.subjects(schoolId)
    }

    /** Per section id; [onDateOnly] keeps only the periods on [date], otherwise the whole week. Timetable errors give an empty map. */
    suspend fun taught(
        date: String,
        sections: List<Section>,
        all: List<Subject>,
        onDateOnly: Boolean,
    ): Map<String, TaughtSubjects> {
        val slots = (timetableRepository.myWeek(weekOf = date) as? AppResult.Success)?.data ?: return emptyMap()
        val dayOfWeek = runCatching { LocalDate.parse(date).dayOfWeek.value }.getOrNull()
        val relevant = if (onDateOnly) slots.filter { it.isOn(date, dayOfWeek) } else slots
        return sections.associate { section ->
            val names = relevant.filter { it.matches(section) }.mapNotNull { it.subjectName?.trim() }.distinct()
            val resolved = names.mapNotNull { name -> all.firstOrNull { it.name.equals(name, ignoreCase = true) } }
            section.id to TaughtSubjects(resolved.distinctBy { it.id }, complete = resolved.size == names.size)
        }.filterValues { it.subjects.isNotEmpty() || !it.complete }
    }

    private fun TeacherSlot.isOn(date: String, dayOfWeek: Int?): Boolean =
        this.date?.take(DATE_LENGTH) == date || (this.date == null && day == dayOfWeek)

    private fun TeacherSlot.matches(section: Section): Boolean =
        sectionName.equals(section.name, ignoreCase = true) &&
            (className == null || section.className == null || className.equals(section.className, ignoreCase = true))

    private companion object {
        const val DATE_LENGTH = 10
    }
}
