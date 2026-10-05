package com.schoolapp.demo

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.dashboard.DashboardRepository
import com.schoolapp.core.data.dashboard.DefaultDashboardRepository
import com.schoolapp.core.model.dashboard.DashboardMetric
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DemoAwareDashboardRepository @Inject constructor(
    private val real: DefaultDashboardRepository,
    private val auth: DemoAwareAuthRepository,
) : DashboardRepository {
    override suspend fun summary(branchId: String?): AppResult<List<DashboardMetric>> =
        if (auth.isDemoActive) AppResult.Success(DemoData.metrics) else real.summary(branchId)
}
