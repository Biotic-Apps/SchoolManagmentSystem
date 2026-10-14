package com.schoolapp.core.data.dashboard

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.dashboard.DashboardMetric
import com.schoolapp.core.model.dashboard.ParentOverview
import com.schoolapp.core.model.dashboard.TeacherToday

interface DashboardRepository {
    suspend fun summary(branchId: String? = null): AppResult<List<DashboardMetric>>

    /** Summary filtered by the School › Branch › Session scope picker; null levels mean "all in my scope". */
    suspend fun scopedSummary(schoolId: String?, branchId: String?, sessionId: String?): AppResult<List<DashboardMetric>> =
        summary(branchId)

    /** Principal/coordinator "Today" queue counts (`/dashboard/pending`). */
    suspend fun pending(branchId: String?, date: String): AppResult<List<DashboardMetric>>

    suspend fun teacherToday(): AppResult<TeacherToday>

    /** Parent home for one linked child (`/parent/home`). */
    suspend fun parentHome(studentId: String): AppResult<ParentOverview>
}
