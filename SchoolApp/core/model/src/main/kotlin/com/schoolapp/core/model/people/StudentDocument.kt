package com.schoolapp.core.model.people

data class StudentDocument(
    val id: String,
    val docType: String,
    val fileUrl: String?,
    val mime: String?,
    val status: String?,
    val note: String?,
)
