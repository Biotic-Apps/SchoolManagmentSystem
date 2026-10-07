package com.schoolapp.core.data.setup

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.setup.SetupChecklist
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.SetupApi
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DefaultSetupRepository @Inject constructor(
    private val api: SetupApi,
    private val apiCaller: ApiCaller,
) : SetupRepository {

    override suspend fun checklist(branchId: String?): AppResult<SetupChecklist> =
        apiCaller.call { api.checklist(branchId).data.toModel() }
}
