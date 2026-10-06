package com.schoolapp.core.network.di

import com.schoolapp.core.network.BuildConfig
import com.schoolapp.core.network.NetworkJson
import com.schoolapp.core.network.api.ApprovalsApi
import com.schoolapp.core.network.api.AuthApi
import com.schoolapp.core.network.api.DashboardApi
import com.schoolapp.core.network.api.MeApi
import com.schoolapp.core.network.api.NotificationsApi
import com.schoolapp.core.network.api.OrganisationApi
import com.schoolapp.core.network.api.StudentsApi
import com.schoolapp.core.network.api.GuardiansApi
import com.schoolapp.core.network.api.StaffApi
import com.schoolapp.core.network.api.TimetableApi
import com.schoolapp.core.network.api.SyllabusApi
import com.schoolapp.core.network.api.AdmissionsApi
import com.schoolapp.core.network.api.ActivitiesApi
import com.schoolapp.core.network.api.AttendanceApi
import com.schoolapp.core.network.api.ComplaintsApi
import com.schoolapp.core.network.api.DevicesApi
import com.schoolapp.core.network.api.DiaryApi
import com.schoolapp.core.network.api.FilesApi
import com.schoolapp.core.network.api.HealthApi
import com.schoolapp.core.network.api.LeaveApi
import com.schoolapp.core.network.api.MeetingsApi
import com.schoolapp.core.network.api.MessagesApi
import com.schoolapp.core.network.api.NoticesApi
import com.schoolapp.core.network.api.PickupApi
import com.schoolapp.core.network.api.RefreshApi
import com.schoolapp.core.network.api.ExamsApi
import com.schoolapp.core.network.api.ProgressApi
import com.schoolapp.core.network.api.FeesApi
import com.schoolapp.core.network.api.PayrollApi
import com.schoolapp.core.network.api.CertificatesApi
import com.schoolapp.core.network.auth.AuthInterceptor
import com.schoolapp.core.network.auth.TokenAuthenticator
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.kotlinx.serialization.asConverterFactory
import timber.log.Timber
import java.util.concurrent.TimeUnit
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
internal object NetworkModule {

    private const val TIMEOUT_SECONDS = 30L

    @Provides
    @ApiBaseUrl
    fun provideBaseUrl(): String = BuildConfig.API_BASE_URL

    @Provides
    @Singleton
    fun provideJson(): Json = NetworkJson

    @Provides
    @Singleton
    fun provideLogging(): HttpLoggingInterceptor =
        HttpLoggingInterceptor { message -> Timber.tag("HTTP").d(message) }.apply {
            level = if (BuildConfig.DEBUG) HttpLoggingInterceptor.Level.BASIC else HttpLoggingInterceptor.Level.NONE
            redactHeader("Authorization")
        }

    @Provides
    @Singleton
    @RefreshClient
    fun provideRefreshClient(logging: HttpLoggingInterceptor): OkHttpClient = OkHttpClient.Builder()
        .connectTimeout(TIMEOUT_SECONDS, TimeUnit.SECONDS)
        .readTimeout(TIMEOUT_SECONDS, TimeUnit.SECONDS)
        .addInterceptor(logging)
        .build()

    @Provides
    @Singleton
    @AuthClient
    fun provideAuthClient(
        @RefreshClient base: OkHttpClient,
        authInterceptor: AuthInterceptor,
        authenticator: TokenAuthenticator,
    ): OkHttpClient = base.newBuilder()
        .apply { interceptors().add(0, authInterceptor) }
        .authenticator(authenticator)
        .build()

    @Provides
    @Singleton
    fun provideRetrofit(@AuthClient client: OkHttpClient, json: Json, @ApiBaseUrl baseUrl: String): Retrofit =
        retrofit(client, json, baseUrl)

    @Provides
    @Singleton
    fun provideAuthApi(retrofit: Retrofit): AuthApi = retrofit.create(AuthApi::class.java)

    @Provides
    @Singleton
    fun provideMeApi(retrofit: Retrofit): MeApi = retrofit.create(MeApi::class.java)

    @Provides
    @Singleton
    fun provideDashboardApi(retrofit: Retrofit): DashboardApi = retrofit.create(DashboardApi::class.java)

    @Provides
    @Singleton
    fun provideApprovalsApi(retrofit: Retrofit): ApprovalsApi = retrofit.create(ApprovalsApi::class.java)

    @Provides
    @Singleton
    fun provideNotificationsApi(retrofit: Retrofit): NotificationsApi = retrofit.create(NotificationsApi::class.java)

    @Provides
    @Singleton
    fun provideOrganisationApi(retrofit: Retrofit): OrganisationApi = retrofit.create(OrganisationApi::class.java)

    @Provides
    @Singleton
    fun provideStudentsApi(retrofit: Retrofit): StudentsApi = retrofit.create(StudentsApi::class.java)

    @Provides
    @Singleton
    fun provideGuardiansApi(retrofit: Retrofit): GuardiansApi = retrofit.create(GuardiansApi::class.java)

    @Provides
    @Singleton
    fun provideStaffApi(retrofit: Retrofit): StaffApi = retrofit.create(StaffApi::class.java)

    @Provides
    @Singleton
    fun provideTimetableApi(retrofit: Retrofit): TimetableApi = retrofit.create(TimetableApi::class.java)

    @Provides
    @Singleton
    fun provideSyllabusApi(retrofit: Retrofit): SyllabusApi = retrofit.create(SyllabusApi::class.java)

    @Provides
    @Singleton
    fun provideAdmissionsApi(retrofit: Retrofit): AdmissionsApi = retrofit.create(AdmissionsApi::class.java)

    @Provides
    @Singleton
    fun provideAttendanceApi(retrofit: Retrofit): AttendanceApi = retrofit.create(AttendanceApi::class.java)

    @Provides
    @Singleton
    fun provideLeaveApi(retrofit: Retrofit): LeaveApi = retrofit.create(LeaveApi::class.java)

    @Provides
    @Singleton
    fun provideDiaryApi(retrofit: Retrofit): DiaryApi = retrofit.create(DiaryApi::class.java)

    @Provides
    @Singleton
    fun provideFilesApi(retrofit: Retrofit): FilesApi = retrofit.create(FilesApi::class.java)

    @Provides
    @Singleton
    fun provideActivitiesApi(retrofit: Retrofit): ActivitiesApi = retrofit.create(ActivitiesApi::class.java)

    @Provides
    @Singleton
    fun provideNoticesApi(retrofit: Retrofit): NoticesApi = retrofit.create(NoticesApi::class.java)

    @Provides
    @Singleton
    fun provideMessagesApi(retrofit: Retrofit): MessagesApi = retrofit.create(MessagesApi::class.java)

    @Provides
    @Singleton
    fun provideComplaintsApi(retrofit: Retrofit): ComplaintsApi = retrofit.create(ComplaintsApi::class.java)

    @Provides
    @Singleton
    fun provideMeetingsApi(retrofit: Retrofit): MeetingsApi = retrofit.create(MeetingsApi::class.java)

    @Provides
    @Singleton
    fun provideHealthApi(retrofit: Retrofit): HealthApi = retrofit.create(HealthApi::class.java)

    @Provides
    @Singleton
    fun providePickupApi(retrofit: Retrofit): PickupApi = retrofit.create(PickupApi::class.java)

    @Provides
    @Singleton
    fun provideExamsApi(retrofit: Retrofit): ExamsApi = retrofit.create(ExamsApi::class.java)

    @Provides
    @Singleton
    fun provideProgressApi(retrofit: Retrofit): ProgressApi = retrofit.create(ProgressApi::class.java)

    @Provides
    @Singleton
    fun provideFeesApi(retrofit: Retrofit): FeesApi = retrofit.create(FeesApi::class.java)

    @Provides
    @Singleton
    fun providePayrollApi(retrofit: Retrofit): PayrollApi = retrofit.create(PayrollApi::class.java)

    @Provides
    @Singleton
    fun provideCertificatesApi(retrofit: Retrofit): CertificatesApi = retrofit.create(CertificatesApi::class.java)

    @Provides
    @Singleton
    fun provideDevicesApi(retrofit: Retrofit): DevicesApi = retrofit.create(DevicesApi::class.java)

    @Provides
    @Singleton
    fun provideRefreshApi(@RefreshClient client: OkHttpClient, json: Json, @ApiBaseUrl baseUrl: String): RefreshApi =
        retrofit(client, json, baseUrl).create(RefreshApi::class.java)

    private fun retrofit(client: OkHttpClient, json: Json, baseUrl: String): Retrofit = Retrofit.Builder()
        .baseUrl(baseUrl)
        .client(client)
        .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))
        .build()
}
