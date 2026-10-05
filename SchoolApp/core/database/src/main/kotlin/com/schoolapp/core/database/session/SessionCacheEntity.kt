package com.schoolapp.core.database.session

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey

/** Single-row snapshot of `/me` for the signed-in user. */
@Entity(tableName = "session_cache")
data class SessionCacheEntity(
    @PrimaryKey val slot: Int = CURRENT_SLOT,
    @ColumnInfo(name = "user_id") val userId: String,
    @ColumnInfo(name = "me_json") val meJson: String,
    @ColumnInfo(name = "updated_at") val updatedAt: Long,
) {
    companion object {
        const val CURRENT_SLOT = 0
    }
}
