package com.schoolapp.core.database

import androidx.room.Database
import androidx.room.RoomDatabase
import com.schoolapp.core.database.outbox.OutboxDao
import com.schoolapp.core.database.outbox.OutboxEntity
import com.schoolapp.core.database.session.SessionCacheDao
import com.schoolapp.core.database.session.SessionCacheEntity

@Database(
    entities = [OutboxEntity::class, SessionCacheEntity::class],
    version = 1,
    exportSchema = true,
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun outboxDao(): OutboxDao
    abstract fun sessionCacheDao(): SessionCacheDao

    companion object {
        const val NAME = "schoolapp.db"
    }
}
