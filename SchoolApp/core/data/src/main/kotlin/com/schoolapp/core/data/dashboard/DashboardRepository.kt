package com.schoolapp.core.data.dashboard

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.dashboard.ChildToday
import com.schoolapp.core.model.dashboard.DashboardMetric
import com.schoolapp.core.model.dashboard.TeacherToday

interface DashboardRepository {
    suspend fun summary(branchId: String? = null): AppResult<List<DashboardMetric>>

    /** Principal/coordinator "Today" queue counts (`/dashboard/pending`). */
    suspend fun pending(branchId: String?, date: String): AppResult<List<DashboardMetric>>

    suspend fun teacherToday(): AppResult<TeacherToday>

    suspend fun childToday(studentId: String): AppResult<ChildToday>
}
