package com.schoolapp.core.database.di

import android.content.Context
import androidx.room.Room
import com.schoolapp.core.database.AppDatabase
import com.schoolapp.core.database.attendance.AttendanceRegisterDao
import com.schoolapp.core.database.outbox.OutboxDao
import com.schoolapp.core.database.outbox.OutboxRefDao
import com.schoolapp.core.database.session.SessionCacheDao
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
internal object DatabaseModule {

    @Provides
    @Singleton
    fun provideDatabase(@ApplicationContext context: Context): AppDatabase =
        Room.databaseBuilder(context, AppDatabase::class.java, AppDatabase.NAME).build()

    @Provides
    fun provideOutboxDao(db: AppDatabase): OutboxDao = db.outboxDao()

    @Provides
    fun provideOutboxRefDao(db: AppDatabase): OutboxRefDao = db.outboxRefDao()

    @Provides
    fun provideSessionCacheDao(db: AppDatabase): SessionCacheDao = db.sessionCacheDao()

    @Provides
    fun provideAttendanceRegisterDao(db: AppDatabase): AttendanceRegisterDao = db.attendanceRegisterDao()
}
