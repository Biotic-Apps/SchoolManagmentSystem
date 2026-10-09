package com.schoolapp.feature.dashboard

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.dashboard.DashboardRepository
import com.schoolapp.core.data.fees.FeesRepository
import com.schoolapp.core.data.organisation.OrganisationRepository
import com.schoolapp.core.data.setup.SetupRepository
import com.schoolapp.core.data.timetable.TimetableRepository
import com.schoolapp.core.model.dashboard.DashboardMetric
import com.schoolapp.core.model.dashboard.ParentOverview
import com.schoolapp.core.model.dashboard.TeacherToday
import com.schoolapp.core.model.fees.FinanceOverview
import com.schoolapp.core.model.fees.PdfJob
import com.schoolapp.core.model.organisation.Section
import com.schoolapp.core.model.setup.SetupChecklist
import com.schoolapp.core.model.timetable.SectionTimetable
import com.schoolapp.core.model.timetable.TeacherSlot
import java.lang.reflect.Proxy

class FakeDashboardRepository : DashboardRepository {
    var summaryResult: AppResult<List<DashboardMetric>> = AppResult.Success(emptyList())
    var pendingResult: AppResult<List<DashboardMetric>> = AppResult.Success(emptyList())
    var teacherResult: AppResult<TeacherToday> = AppResult.Failure(AppError.Network)
    val childResults = mutableMapOf<String, AppResult<ParentOverview>>()
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

    override suspend fun parentHome(studentId: String): AppResult<ParentOverview> {
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

    var section: SectionTimetable? = null

    override suspend fun sectionTimetable(sectionId: String): AppResult<SectionTimetable> =
        section?.let { AppResult.Success(it) } ?: AppResult.Failure(AppError.Network)

    override suspend fun overrides(branchId: String, date: String): AppResult<List<com.schoolapp.core.model.timetable.TimetableOverride>> =
        AppResult.Success(emptyList())

    override suspend fun assignSubstitute(
        input: com.schoolapp.core.model.timetable.OverrideInput,
    ): AppResult<com.schoolapp.core.model.timetable.TimetableOverride> = AppResult.Failure(AppError.Network)

    override suspend fun removeOverride(id: String): AppResult<Unit> = AppResult.Failure(AppError.Network)
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

/** Fees stub answering only `financeOverview` and `invoicePdf` (suspend calls arrive with a trailing continuation). */
class FakeFinanceFees {
    var result: AppResult<FinanceOverview> = AppResult.Failure(AppError.Network)
    var pdfResult: AppResult<PdfJob> = AppResult.Failure(AppError.Network)
    val pdfCalls = mutableListOf<String>()
    val calls = mutableListOf<Pair<String?, String?>>()

    val repository: FeesRepository = Proxy.newProxyInstance(
        FeesRepository::class.java.classLoader, arrayOf(FeesRepository::class.java),
    ) { _, method, args ->
        when (method.name) {
            "financeOverview" -> {
                calls += args[0] as String? to args[1] as String?
                result
            }
            "invoicePdf" -> {
                pdfCalls += args[0] as String
                pdfResult
            }
            else -> error("not used: ${method.name}")
        }
    } as FeesRepository
}

/** Setup checklist stub; fails by default so existing dashboards behave as before the card existed. */
class FakeSetupRepository : SetupRepository {
    var result: AppResult<SetupChecklist> = AppResult.Failure(AppError.Network)
    val calls = mutableListOf<String?>()

    override suspend fun checklist(branchId: String?): AppResult<SetupChecklist> {
        calls += branchId
        return result
    }
}
