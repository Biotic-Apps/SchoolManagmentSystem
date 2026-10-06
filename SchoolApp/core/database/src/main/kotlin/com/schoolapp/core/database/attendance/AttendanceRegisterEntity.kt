package com.schoolapp.core.database.attendance

import androidx.room.ColumnInfo
import androidx.room.Entity

/**
 * Device cache of one section/date register: [registerJson] is the last server copy,
 * [localMarksJson] the marks saved here but not yet accepted by the server (null when none).
 */
@Entity(tableName = "attendance_registers", primaryKeys = ["section_id", "date"])
data class AttendanceRegisterEntity(
    @ColumnInfo(name = "section_id") val sectionId: String,
    val date: String,
    @ColumnInfo(name = "register_json") val registerJson: String,
    @ColumnInfo(name = "local_marks_json") val localMarksJson: String?,
    @ColumnInfo(name = "updated_at") val updatedAt: Long,
)
