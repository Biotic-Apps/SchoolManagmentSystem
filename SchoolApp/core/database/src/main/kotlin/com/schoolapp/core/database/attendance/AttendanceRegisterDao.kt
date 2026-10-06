package com.schoolapp.core.database.attendance

import androidx.room.Dao
import androidx.room.Query
import androidx.room.Upsert

@Dao
interface AttendanceRegisterDao {
    @Query("SELECT * FROM attendance_registers WHERE section_id = :sectionId AND date = :date")
    suspend fun get(sectionId: String, date: String): AttendanceRegisterEntity?

    @Upsert
    suspend fun upsert(entity: AttendanceRegisterEntity)

    @Query("UPDATE attendance_registers SET local_marks_json = NULL WHERE section_id = :sectionId AND date = :date")
    suspend fun clearLocal(sectionId: String, date: String)

    /** Most recently dated cached register of the section; its roster seeds an offline open of a new date. */
    @Query("SELECT * FROM attendance_registers WHERE section_id = :sectionId ORDER BY date DESC LIMIT 1")
    suspend fun latestForSection(sectionId: String): AttendanceRegisterEntity?
}
