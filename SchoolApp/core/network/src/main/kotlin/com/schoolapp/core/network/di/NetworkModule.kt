package com.schoolapp.core.network.di

import com.schoolapp.core.network.BuildConfig
import com.schoolapp.core.network.NetworkJson
import com.schoolapp.core.network.api.ApprovalsApi
import com.schoolapp.core.network.api.AuthApi
import com.schoolapp.core.network.api.DashboardApi
import com.schoolapp.core.network.api.MeApi
import com.schoolapp.core.network.api.NotificationsApi
import com.schoolapp.core.network.api.OrganisationApi
import com.schoolapp.core.network.api.RefreshApi
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
    fun provideRefreshApi(@RefreshClient client: OkHttpClient, json: Json, @ApiBaseUrl baseUrl: String): RefreshApi =
        retrofit(client, json, baseUrl).create(RefreshApi::class.java)

    private fun retrofit(client: OkHttpClient, json: Json, baseUrl: String): Retrofit = Retrofit.Builder()
        .baseUrl(baseUrl)
        .client(client)
        .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))
        .build()
}
