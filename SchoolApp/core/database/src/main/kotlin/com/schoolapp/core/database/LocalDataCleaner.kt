package com.schoolapp.core.database

import com.schoolapp.core.common.dispatcher.IoDispatcher
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.withContext
import javax.inject.Inject

/** Wipes every table; used on logout and when a different user signs in. */
class LocalDataCleaner @Inject constructor(
    private val database: AppDatabase,
    @IoDispatcher private val io: CoroutineDispatcher,
) {
    suspend fun clearAll() = withContext(io) { database.clearAllTables() }
}
