package com.schoolapp.core.data.setup

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.setup.SetupChecklist

interface SetupRepository {
    /** "Set up your school" progress for [branchId] (null = the principal's own branch). */
    suspend fun checklist(branchId: String? = null): AppResult<SetupChecklist>
}
