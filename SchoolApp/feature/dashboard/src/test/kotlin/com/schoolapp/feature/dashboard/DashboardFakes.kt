package com.schoolapp.feature.dashboard

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.dashboard.DashboardRepository
import com.schoolapp.core.data.organisation.OrganisationRepository
import com.schoolapp.core.data.timetable.TimetableRepository
import com.schoolapp.core.model.dashboard.ChildToday
import com.schoolapp.core.model.dashboard.DashboardMetric
import com.schoolapp.core.model.dashboard.TeacherToday
import com.schoolapp.core.model.organisation.Section
import com.schoolapp.core.model.timetable.SectionTimetable
import com.schoolapp.core.model.timetable.TeacherSlot
import java.lang.reflect.Proxy

class FakeDashboardRepository : DashboardRepository {
    var summaryResult: AppResult<List<DashboardMetric>> = AppResult.Success(emptyList())
    var pendingResult: AppResult<List<DashboardMetric>> = AppResult.Success(emptyList())
    var teacherResult: AppResult<TeacherToday> = AppResult.Failure(AppError.Network)
    val childResults = mutableMapOf<String, AppResult<ChildToday>>()
    val pendingCalls = mutableListOf<Pair<String?, String>>()
    val childCalls = mutableListOf<String>()
    var summaryCalls = 0

    override suspend fun summary(branchId: String?): AppResult<List<DashboardMetric>> {
        summaryCalls++
        return summaryResult
    }

    override suspend fun pending(branchId: String?, date: String): AppResult<List<DashboardMetric>> {
        pendingCalls += branchId to date
        return pendingResult
    }

    override suspend fun teacherToday(): AppResult<TeacherToday> = teacherResult

    override suspend fun childToday(studentId: String): AppResult<ChildToday> {
        childCalls += studentId
        return childResults[studentId] ?: AppResult.Failure(AppError.Network)
    }
}

class FakeTimetableRepository(private val week: List<TeacherSlot>) : TimetableRepository {
    var calls = 0

    override suspend fun myWeek(weekOf: String?, studentId: String?): AppResult<List<TeacherSlot>> {
        calls++
        return AppResult.Success(week)
    }

    override suspend fun sectionTimetable(sectionId: String): AppResult<SectionTimetable> = error("not used")
}

/** Organisation stub that only answers what `ScopedSections` asks for. */
fun organisationWith(sections: List<Section>): OrganisationRepository = Proxy.newProxyInstance(
    OrganisationRepository::class.java.classLoader, arrayOf(OrganisationRepository::class.java),
) { _, method, _ ->
    when (method.name) {
        "sessions" -> AppResult.Success(emptyList<Any>())
        "sections" -> AppResult.Success(sections)
        else -> error("not used: ${method.name}")
    }
} as OrganisationRepository
