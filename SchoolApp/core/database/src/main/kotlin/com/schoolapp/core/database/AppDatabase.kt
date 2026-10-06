package com.schoolapp.core.database

import androidx.room.AutoMigration
import androidx.room.Database
import androidx.room.RoomDatabase
import com.schoolapp.core.database.attendance.AttendanceRegisterDao
import com.schoolapp.core.database.attendance.AttendanceRegisterEntity
import com.schoolapp.core.database.outbox.OutboxDao
import com.schoolapp.core.database.outbox.OutboxEntity
import com.schoolapp.core.database.outbox.OutboxRefDao
import com.schoolapp.core.database.outbox.OutboxRefEntity
import com.schoolapp.core.database.session.SessionCacheDao
import com.schoolapp.core.database.session.SessionCacheEntity

@Database(
    entities = [
        OutboxEntity::class,
        SessionCacheEntity::class,
        AttendanceRegisterEntity::class,
        OutboxRefEntity::class,
    ],
    version = 2,
    exportSchema = true,
    autoMigrations = [AutoMigration(from = 1, to = 2)],
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun outboxDao(): OutboxDao
    abstract fun outboxRefDao(): OutboxRefDao
    abstract fun sessionCacheDao(): SessionCacheDao
    abstract fun attendanceRegisterDao(): AttendanceRegisterDao

    companion object {
        const val NAME = "schoolapp.db"
    }
}
