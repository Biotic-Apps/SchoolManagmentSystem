package com.schoolapp.core.model.organisation

data class Section(
    val id: String,
    val classId: String?,
    val className: String?,
    val name: String,
    val capacity: Int?,
    val roomName: String?,
    val studentCount: Int,
    val status: String?,
)
