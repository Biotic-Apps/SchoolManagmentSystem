package com.schoolapp.demo

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.dashboard.DashboardRepository
import com.schoolapp.core.data.dashboard.DefaultDashboardRepository
import com.schoolapp.core.model.dashboard.ChildToday
import com.schoolapp.core.model.dashboard.DashboardMetric
import com.schoolapp.core.model.dashboard.TeacherToday
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DemoAwareDashboardRepository @Inject constructor(
    private val real: DefaultDashboardRepository,
    private val auth: DemoAwareAuthRepository,
) : DashboardRepository {
    override suspend fun summary(branchId: String?): AppResult<List<DashboardMetric>> =
        if (auth.isDemoActive) AppResult.Success(DemoData.metrics) else real.summary(branchId)

    override suspend fun pending(branchId: String?, date: String): AppResult<List<DashboardMetric>> =
        if (auth.isDemoActive) AppResult.Success(DemoDashboardData.pending(date)) else real.pending(branchId, date)

    override suspend fun teacherToday(): AppResult<TeacherToday> =
        if (auth.isDemoActive) {
            AppResult.Success(DemoDashboardData.teacherToday(auth.demoSession.value?.activeRole))
        } else {
            real.teacherToday()
        }

    override suspend fun childToday(studentId: String): AppResult<ChildToday> =
        if (auth.isDemoActive) AppResult.Success(DemoDashboardData.childToday(studentId)) else real.childToday(studentId)
}
