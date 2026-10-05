package com.schoolapp.core.data.dashboard

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.dashboard.DashboardMetric

interface DashboardRepository {
    suspend fun summary(branchId: String? = null): AppResult<List<DashboardMetric>>
}
