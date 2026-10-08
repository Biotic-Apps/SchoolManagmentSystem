package com.schoolapp.feature.organisation

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.organisation.ClassesOverviewRepository
import com.schoolapp.core.model.organisation.ClassOverview
import com.schoolapp.core.model.organisation.SectionOverview

/** Builds cards from [source]'s classes and sections and shares its failure switch. */
class FakeClassesOverviewRepository(private val source: FakeOrganisationRepository) : ClassesOverviewRepository {
    val requests = mutableListOf<Triple<String, String?, String?>>()

    override suspend fun overview(branchId: String, schoolId: String?, sessionId: String?): AppResult<List<ClassOverview>> {
        requests += Triple(branchId, schoolId, sessionId)
        source.failure?.let { return AppResult.Failure(it) }
        return AppResult.Success(
            source.classes.map { schoolClass ->
                val sections = source.sections.filter { it.classId == schoolClass.id }
                ClassOverview(
                    id = schoolClass.id, name = schoolClass.name, levelOrder = schoolClass.levelOrder, status = "ACTIVE",
                    studentCount = sections.sumOf { it.studentCount }, capacity = null,
                    sections = sections.map { SectionOverview(it.id, it.name, null, it.studentCount, it.capacity, it.roomName, null, null) },
                    subjects = emptyList(), issues = emptyList(), unallocated = 0,
                )
            },
        )
    }
}
