package com.schoolapp.di

import com.schoolapp.ui.LoginFooterContent
import dagger.BindsOptionalOf
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent

@Module
@InstallIn(SingletonComponent::class)
interface AppModule {
    @BindsOptionalOf
    fun optionalLoginFooter(): LoginFooterContent
}
