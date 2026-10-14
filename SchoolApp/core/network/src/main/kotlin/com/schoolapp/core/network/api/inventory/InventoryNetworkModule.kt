package com.schoolapp.core.network.api.inventory

import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import retrofit2.Retrofit
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object InventoryNetworkModule {
    @Provides
    @Singleton
    fun provideInventoryApi(retrofit: Retrofit): InventoryApi = retrofit.create(InventoryApi::class.java)

    @Provides
    @Singleton
    fun providePurchasingApi(retrofit: Retrofit): PurchasingApi = retrofit.create(PurchasingApi::class.java)
}
