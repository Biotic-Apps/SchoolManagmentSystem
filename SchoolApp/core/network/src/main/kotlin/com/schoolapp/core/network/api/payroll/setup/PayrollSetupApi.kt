package com.schoolapp.core.network.api.payroll.setup

import com.schoolapp.core.network.dto.payroll.setup.BranchIdBodyDto
import com.schoolapp.core.network.dto.payroll.setup.PayrollSettingsBodyDto
import com.schoolapp.core.network.dto.payroll.setup.PayrollSettingsDto
import com.schoolapp.core.network.dto.payroll.setup.PayrollStaffListDto
import com.schoolapp.core.network.dto.payroll.setup.SalaryStructureBodyDto
import com.schoolapp.core.network.dto.payroll.setup.SalaryStructuresDto
import com.schoolapp.core.network.model.ApiEnvelope
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import kotlinx.serialization.json.JsonObject
import retrofit2.Retrofit
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Path
import retrofit2.http.Query
import javax.inject.Singleton

/** Salary setup (staff on payroll, salary structures) and the school pay rules. */
interface PayrollSetupApi {
    @GET("payroll/staff")
    suspend fun staff(@Query("branchId") branchId: String, @Query("designation") designation: String? = null): ApiEnvelope<PayrollStaffListDto>

    /** Creates the branch principal's payroll record (`payroll.edit`). */
    @POST("payroll/staff/principal")
    suspend fun addPrincipal(@Body body: BranchIdBodyDto): ApiEnvelope<JsonObject>

    @GET("staff/{id}/salary-structure")
    suspend fun structure(@Path("id") staffId: String): ApiEnvelope<SalaryStructuresDto>

    /** Appends a new structure row; history is never edited (`payroll.edit`). */
    @PUT("staff/{id}/salary-structure")
    suspend fun saveStructure(@Path("id") staffId: String, @Body body: SalaryStructureBodyDto): ApiEnvelope<SalaryStructuresDto>

    @GET("payroll/settings")
    suspend fun settings(@Query("branchId") branchId: String): ApiEnvelope<PayrollSettingsDto>

    /** `payroll.approve`; school-wide rules saved through any branch. */
    @PUT("payroll/settings")
    suspend fun saveSettings(@Query("branchId") branchId: String, @Body body: PayrollSettingsBodyDto): ApiEnvelope<JsonObject>
}

@Module
@InstallIn(SingletonComponent::class)
object PayrollSetupNetworkModule {
    @Provides
    @Singleton
    fun providePayrollSetupApi(retrofit: Retrofit): PayrollSetupApi = retrofit.create(PayrollSetupApi::class.java)
}
