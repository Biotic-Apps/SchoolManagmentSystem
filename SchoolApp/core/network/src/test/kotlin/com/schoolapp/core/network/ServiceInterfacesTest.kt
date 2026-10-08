package com.schoolapp.core.network

import com.schoolapp.core.network.api.AcademicsApi
import com.schoolapp.core.network.api.ActivitiesApi
import com.schoolapp.core.network.api.AdmissionsApi
import com.schoolapp.core.network.api.AllocationApi
import com.schoolapp.core.network.api.ApprovalsApi
import com.schoolapp.core.network.api.AttendanceApi
import com.schoolapp.core.network.api.AuthApi
import com.schoolapp.core.network.api.BrandingApi
import com.schoolapp.core.network.api.CertificatesApi
import com.schoolapp.core.network.api.ComplaintsApi
import com.schoolapp.core.network.api.DashboardApi
import com.schoolapp.core.network.api.DevicesApi
import com.schoolapp.core.network.api.DiaryApi
import com.schoolapp.core.network.api.ExamsApi
import com.schoolapp.core.network.api.FeesApi
import com.schoolapp.core.network.api.FilesApi
import com.schoolapp.core.network.api.GuardiansApi
import com.schoolapp.core.network.api.HealthApi
import com.schoolapp.core.network.api.LeaveApi
import com.schoolapp.core.network.api.MeApi
import com.schoolapp.core.network.api.MeetingsApi
import com.schoolapp.core.network.api.MessagesApi
import com.schoolapp.core.network.api.NoticesApi
import com.schoolapp.core.network.api.NotificationsApi
import com.schoolapp.core.network.api.OrganisationApi
import com.schoolapp.core.network.api.PayrollApi
import com.schoolapp.core.network.api.PickupApi
import com.schoolapp.core.network.api.ProgressApi
import com.schoolapp.core.network.api.RefreshApi
import com.schoolapp.core.network.api.SetupApi
import com.schoolapp.core.network.api.StaffApi
import com.schoolapp.core.network.api.StaffAttendanceApi
import com.schoolapp.core.network.api.StudentAdminApi
import com.schoolapp.core.network.api.StudentsApi
import com.schoolapp.core.network.api.SyllabusApi
import com.schoolapp.core.network.api.TimetableApi
import com.schoolapp.core.network.api.TimetableEditApi
import com.schoolapp.core.network.api.TimetableOverridesApi
import okhttp3.MediaType.Companion.toMediaType
import org.junit.Test
import retrofit2.Retrofit
import retrofit2.converter.kotlinx.serialization.asConverterFactory

/**
 * Builds every Retrofit service with the app's real converter and `validateEagerly`, so an unsupported body or
 * return type (e.g. a Map or wildcard @Body) fails here instead of crashing on a phone.
 */
class ServiceInterfacesTest {

    @Test
    fun every_service_method_parses_with_the_real_converter() {
        val retrofit = Retrofit.Builder()
            .baseUrl("http://localhost/api/v1/")
            .addConverterFactory(NetworkJson.asConverterFactory("application/json".toMediaType()))
            .validateEagerly(true)
            .build()
        SERVICES.forEach { service ->
            runCatching { retrofit.create(service) }.onFailure { throw AssertionError("${service.simpleName}: ${it.message}", it) }
        }
    }

    private companion object {
        val SERVICES = listOf(
            AcademicsApi::class.java, ActivitiesApi::class.java, AdmissionsApi::class.java, AllocationApi::class.java,
            ApprovalsApi::class.java, AttendanceApi::class.java, AuthApi::class.java, BrandingApi::class.java,
            CertificatesApi::class.java, ComplaintsApi::class.java, DashboardApi::class.java, DevicesApi::class.java,
            DiaryApi::class.java, ExamsApi::class.java, FeesApi::class.java, FilesApi::class.java, GuardiansApi::class.java,
            HealthApi::class.java, LeaveApi::class.java, MeApi::class.java, MeetingsApi::class.java, MessagesApi::class.java,
            NoticesApi::class.java, NotificationsApi::class.java, OrganisationApi::class.java, PayrollApi::class.java,
            PickupApi::class.java, ProgressApi::class.java, RefreshApi::class.java, SetupApi::class.java, StaffApi::class.java,
            StaffAttendanceApi::class.java, StudentAdminApi::class.java, StudentsApi::class.java, SyllabusApi::class.java,
            TimetableApi::class.java, TimetableEditApi::class.java, TimetableOverridesApi::class.java,
        )
    }
}
