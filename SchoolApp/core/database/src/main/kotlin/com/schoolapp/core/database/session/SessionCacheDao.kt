package com.schoolapp.core.database.session

import androidx.room.Dao
import androidx.room.Query
import androidx.room.Upsert
import kotlinx.coroutines.flow.Flow

@Dao
interface SessionCacheDao {

    @Upsert
    suspend fun upsert(entry: SessionCacheEntity)

    @Query("SELECT * FROM session_cache WHERE slot = 0")
    fun observe(): Flow<SessionCacheEntity?>

    @Query("SELECT * FROM session_cache WHERE slot = 0")
    suspend fun get(): SessionCacheEntity?

    @Query("DELETE FROM session_cache")
    suspend fun clear()
}
