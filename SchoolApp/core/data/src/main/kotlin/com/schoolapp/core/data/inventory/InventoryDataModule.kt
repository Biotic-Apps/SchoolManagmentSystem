package com.schoolapp.core.data.inventory

import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent

@Module
@InstallIn(SingletonComponent::class)
interface InventoryDataModule {
    @Binds
    fun bindInventoryRepository(impl: DefaultInventoryRepository): InventoryRepository

    @Binds
    fun bindPurchasingRepository(impl: DefaultPurchasingRepository): PurchasingRepository
}
