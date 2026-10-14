package com.schoolapp.core.data.payroll.setup

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.payroll.setup.PayRules
import com.schoolapp.core.model.payroll.setup.PayRulesView
import com.schoolapp.core.model.payroll.setup.PayrollStaffList
import com.schoolapp.core.model.payroll.setup.SalaryStructureInput
import com.schoolapp.core.model.payroll.setup.SalaryStructures
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.payroll.setup.PayrollSetupApi
import com.schoolapp.core.network.dto.payroll.setup.BranchIdBodyDto
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Inject
import javax.inject.Singleton

/** Salary setup of a branch and the school pay rules. */
interface PayrollSetupRepository {
    suspend fun staff(branchId: String, designation: String? = null): AppResult<PayrollStaffList>

    suspend fun addPrincipal(branchId: String): AppResult<Unit>

    /** A staff member without a structure yet comes back empty. */
    suspend fun structures(staffId: String): AppResult<SalaryStructures>

    suspend fun saveStructure(staffId: String, input: SalaryStructureInput): AppResult<SalaryStructures>

    suspend fun rules(branchId: String): AppResult<PayRulesView>

    suspend fun saveRules(branchId: String, rules: PayRules): AppResult<Unit>
}

@Singleton
class DefaultPayrollSetupRepository @Inject constructor(
    private val api: PayrollSetupApi,
    private val apiCaller: ApiCaller,
) : PayrollSetupRepository {

    override suspend fun staff(branchId: String, designation: String?): AppResult<PayrollStaffList> =
        apiCaller.call { api.staff(branchId, designation).data.toModel() }

    override suspend fun addPrincipal(branchId: String): AppResult<Unit> = apiCaller.call {
        api.addPrincipal(BranchIdBodyDto(branchId))
        Unit
    }

    override suspend fun structures(staffId: String): AppResult<SalaryStructures> =
        when (val result = apiCaller.call { api.structure(staffId).data.toModel() }) {
            is AppResult.Success -> result
            is AppResult.Failure -> {
                val error = result.error
                if (error is AppError.Server && error.httpCode == HTTP_NOT_FOUND) AppResult.Success(SalaryStructures(null, emptyList())) else result
            }
        }

    override suspend fun saveStructure(staffId: String, input: SalaryStructureInput): AppResult<SalaryStructures> =
        apiCaller.call { api.saveStructure(staffId, input.toBody()).data.toModel() }

    override suspend fun rules(branchId: String): AppResult<PayRulesView> = apiCaller.call { api.settings(branchId).data.toModel() }

    override suspend fun saveRules(branchId: String, rules: PayRules): AppResult<Unit> = apiCaller.call {
        api.saveSettings(branchId, rules.toBody())
        Unit
    }

    private companion object {
        const val HTTP_NOT_FOUND = 404
    }
}

@Module
@InstallIn(SingletonComponent::class)
interface PayrollSetupDataModule {
    @Binds
    fun bindPayrollSetupRepository(impl: DefaultPayrollSetupRepository): PayrollSetupRepository
}
